const Complaint = require('../models/Complaint');
const { CATEGORIES, STATUSES } = require('../models/Complaint');
const Category = require('../models/Category');
const User = require('../models/User');
const { resolveAuthorityCategory } = require('../utils/authorityCategory');

function averageResolutionDays(complaints) {
  const durations = complaints
    .map((complaint) => {
      const resolvedEntry = [...(complaint.statusHistory || [])]
        .reverse()
        .find((entry) => entry.status === 'Resolved');
      const endTimestamp = resolvedEntry?.timestamp || complaint.updatedAt;
      if (!endTimestamp || !complaint.createdAt) {
        return null;
      }
      const ms = Math.max(0, new Date(endTimestamp) - new Date(complaint.createdAt));
      return ms / (1000 * 60 * 60 * 24);
    })
    .filter((value) => value !== null && !Number.isNaN(value));

  if (durations.length === 0) {
    return null;
  }

  const avg = durations.reduce((sum, value) => sum + value, 0) / durations.length;
  return Math.round(avg * 10) / 10;
}

function buildAnalyticsFilter(query, user) {
  const { dateFrom, dateTo, category, status } = query;
  const conditions = [];

  if (dateFrom || dateTo) {
    const createdAt = {};
    if (dateFrom) {
      const from = new Date(dateFrom);
      if (Number.isNaN(from.getTime())) {
        return { error: 'Invalid dateFrom' };
      }
      createdAt.$gte = from;
    }

    if (dateTo) {
      const to = new Date(dateTo);
      if (Number.isNaN(to.getTime())) {
        return { error: 'Invalid dateTo' };
      }
      to.setHours(23, 59, 59, 999);
      createdAt.$lte = to;
    }
    conditions.push({ createdAt });
  }

  if (status && status.trim()) {
    if (!STATUSES.includes(status.trim())) {
      return { error: 'Invalid status filter' };
    }
    conditions.push({ status: status.trim() });
  }

  let authorityCategory = null;
  if (user?.role === 'authority') {
    authorityCategory = resolveAuthorityCategory(user);
    if (authorityCategory) {
      conditions.push({
        $or: [{ category: authorityCategory }, { assignedAuthorityId: user._id }],
      });
    } else {
      conditions.push({ assignedAuthorityId: user._id });
    }
  } else if (category && category.trim()) {
    conditions.push({ category: category.trim() });
  }

  if (conditions.length === 0) {
    return { filter: {}, authorityCategory, error: null };
  }
  if (conditions.length === 1) {
    return { filter: conditions[0], authorityCategory, error: null };
  }
  return { filter: { $and: conditions }, authorityCategory, error: null };
}

function csvEscape(value) {
  const str = String(value ?? '');
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

exports.getSummary = async (req, res, next) => {
  try {
    const { filter: dateFilter, authorityCategory, error } = buildAnalyticsFilter(
      req.query,
      req.user
    );
    if (error) {
      return res.status(400).json({ message: error });
    }

    const matchStage = Object.keys(dateFilter).length ? [{ $match: dateFilter }] : [];
    const resolvedFilter = Object.keys(dateFilter).length
      ? { $and: [dateFilter, { status: 'Resolved' }] }
      : { status: 'Resolved' };

    const [
      byCategory,
      byStatus,
      resolvedComplaints,
      totalComplaints,
      allMatchingComplaints,
      userRoleCounts,
      authorityUsers,
      customCategories,
      recentComplaintsDocs,
    ] = await Promise.all([
      Complaint.aggregate([
        ...matchStage,
        {
          $group: {
            _id: '$category',
            count: { $sum: 1 },
            resolvedCount: {
              $sum: { $cond: [{ $eq: ['$status', 'Resolved'] }, 1, 0] },
            },
            pendingVerificationCount: {
              $sum: { $cond: [{ $eq: ['$status', 'Pending Verification'] }, 1, 0] },
            },
            activeCount: {
              $sum: {
                $cond: [
                  { $in: ['$status', ['Verified', 'Assigned', 'In Progress']] },
                  1,
                  0,
                ],
              },
            },
            pendingCount: {
              $sum: {
                $cond: [
                  { $in: ['$status', ['Pending Verification', 'Verified', 'Assigned', 'In Progress']] },
                  1,
                  0,
                ],
              },
            },
            closedCount: {
              $sum: {
                $cond: [{ $in: ['$status', ['Rejected', 'Unable to Resolve']] }, 1, 0],
              },
            },
          },
        },
        { $sort: { count: -1 } },
      ]),
      Complaint.aggregate([
        ...matchStage,
        { $group: { _id: '$status', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      Complaint.find(resolvedFilter).select('createdAt updatedAt statusHistory'),
      Complaint.countDocuments(dateFilter),
      Complaint.find(dateFilter)
        .select('createdAt updatedAt status assignedAuthorityId category statusHistory')
        .populate('assignedAuthorityId', 'name email category department')
        .sort({ createdAt: 1 }),
      User.aggregate([
        {
          $group: {
            _id: '$role',
            total: { $sum: 1 },
            active: { $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] } },
            disabled: {
              $sum: { $cond: [{ $in: ['$status', ['disabled', 'blocked']] }, 1, 0] },
            },
          },
        },
      ]),
      User.find({ role: 'authority' })
        .select('name email category department status')
        .sort({ name: 1 }),
      Category.find({}).select('name'),
      Complaint.find(dateFilter)
        .populate('citizenId', 'name email')
        .populate('assignedAuthorityId', 'name email category')
        .sort({ createdAt: -1 })
        .limit(6),
    ]);

    const statusCountMap = Object.fromEntries(byStatus.map((item) => [item._id, item.count]));

    const pendingVerificationCount = statusCountMap['Pending Verification'] || 0;
    const verifiedCount = statusCountMap['Verified'] || 0;
    const assignedCount = statusCountMap['Assigned'] || 0;
    const inProgressOnlyCount = statusCountMap['In Progress'] || 0;
    const inProgressCount = verifiedCount + assignedCount + inProgressOnlyCount;
    const resolvedCount = statusCountMap['Resolved'] || 0;
    const rejectedCount = statusCountMap['Rejected'] || 0;
    const unableToResolveCount = statusCountMap['Unable to Resolve'] || 0;
    const closedCount = rejectedCount + unableToResolveCount;

    const resolvedPercent =
      totalComplaints === 0 ? 0 : Math.round((resolvedCount / totalComplaints) * 1000) / 10;

    // Build Authority breakdown (including explicit assignments and department category matching)
    const authorityMap = new Map();
    const categoryToAuthorityId = new Map();

    for (const authUser of authorityUsers) {
      const authId = String(authUser._id);
      const deptCategory =
        resolveAuthorityCategory(authUser) || authUser.category || authUser.department || 'General';
      authorityMap.set(authId, {
        id: authId,
        name: authUser.name,
        email: authUser.email,
        category: deptCategory,
        status: authUser.status,
        assigned: 0,
        explicitlyAssigned: 0,
        resolved: 0,
        inProgress: 0,
        pendingVerification: 0,
        closed: 0,
      });
      if (deptCategory && !categoryToAuthorityId.has(deptCategory)) {
        categoryToAuthorityId.set(deptCategory, authId);
      }
    }

    for (const c of allMatchingComplaints) {
      let targetAuthId = null;
      if (c.assignedAuthorityId) {
        const populatedId = String(c.assignedAuthorityId._id || c.assignedAuthorityId);
        targetAuthId = populatedId;
        if (!authorityMap.has(populatedId) && c.assignedAuthorityId.name) {
          authorityMap.set(populatedId, {
            id: populatedId,
            name: c.assignedAuthorityId.name,
            email: c.assignedAuthorityId.email || '',
            category: c.assignedAuthorityId.category || c.category,
            status: 'active',
            assigned: 0,
            explicitlyAssigned: 0,
            resolved: 0,
            inProgress: 0,
            pendingVerification: 0,
            closed: 0,
          });
        }
      } else if (c.category && categoryToAuthorityId.has(c.category)) {
        targetAuthId = categoryToAuthorityId.get(c.category);
      }

      if (targetAuthId && authorityMap.has(targetAuthId)) {
        const current = authorityMap.get(targetAuthId);
        current.assigned += 1;
        if (c.assignedAuthorityId) {
          current.explicitlyAssigned += 1;
        }
        if (c.status === 'Resolved') {
          current.resolved += 1;
        } else if (c.status === 'Pending Verification') {
          current.pendingVerification += 1;
          current.inProgress += 1;
        } else if (['Verified', 'Assigned', 'In Progress'].includes(c.status)) {
          current.inProgress += 1;
        } else {
          current.closed += 1;
        }
      }
    }

    const byAuthority = Array.from(authorityMap.values()).sort(
      (a, b) => b.assigned - a.assigned || b.resolved - a.resolved || a.name.localeCompare(b.name)
    );

    // Build last 6 months trend
    const now = new Date();
    const monthlyTrend = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      monthlyTrend.push({ key, label, submitted: 0, resolved: 0 });
    }

    for (const c of allMatchingComplaints) {
      const created = new Date(c.createdAt);
      const key = `${created.getFullYear()}-${String(created.getMonth() + 1).padStart(2, '0')}`;
      const bucket = monthlyTrend.find((m) => m.key === key);
      if (bucket) {
        bucket.submitted += 1;
        if (c.status === 'Resolved') {
          bucket.resolved += 1;
        }
      }
    }

    // Distinct category count (built-in + custom)
    const distinctCategoryNames = new Set([
      ...CATEGORIES,
      ...customCategories.map((c) => c.name).filter(Boolean),
    ]);

    // User summary counts
    const roleLookup = Object.fromEntries(userRoleCounts.map((r) => [r._id, r]));
    const citizensTotal = roleLookup.citizen?.total || 0;
    const authoritiesTotal = roleLookup.authority?.total || 0;
    const adminsTotal = roleLookup.admin?.total || 0;

    const userStats = {
      totalUsers: citizensTotal + authoritiesTotal + adminsTotal,
      citizens: citizensTotal,
      activeCitizens: roleLookup.citizen?.active || 0,
      blockedCitizens: roleLookup.citizen?.disabled || 0,
      disabledCitizens: roleLookup.citizen?.disabled || 0,
      authorities: authoritiesTotal,
      activeAuthorities: roleLookup.authority?.active || 0,
      disabledAuthorities: roleLookup.authority?.disabled || 0,
      admins: adminsTotal,
      activeAdmins: roleLookup.admin?.active || 0,
      totalCategories: distinctCategoryNames.size,
    };

    const recentComplaints = recentComplaintsDocs.map((doc) => ({
      id: doc._id,
      complaintId: doc.complaintId,
      title: doc.title,
      category: doc.category,
      status: doc.status,
      location: doc.location,
      createdAt: doc.createdAt,
      citizen: doc.citizenId ? { name: doc.citizenId.name, email: doc.citizenId.email } : null,
      assignedAuthority: doc.assignedAuthorityId
        ? { name: doc.assignedAuthorityId.name, category: doc.assignedAuthorityId.category }
        : null,
    }));

    res.json({
      summary: {
        totalComplaints,
        resolvedCount,
        rejectedCount,
        unableToResolveCount,
        closedCount,
        pendingVerificationCount,
        verifiedCount,
        assignedCount,
        inProgressOnlyCount,
        inProgressCount,
        resolvedPercent,
        averageResolutionDays: averageResolutionDays(resolvedComplaints),
        authorityCategory,
        byCategory: byCategory.map((item) => ({
          category: item._id,
          count: item.count,
          resolvedCount: item.resolvedCount,
          pendingVerificationCount: item.pendingVerificationCount,
          activeCount: item.activeCount,
          pendingCount: item.pendingCount,
          closedCount: item.closedCount,
        })),
        byStatus: byStatus.map((item) => ({ status: item._id, count: item.count })),
        byAuthority,
        monthlyTrend,
        userStats,
        recentComplaints,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.exportCsv = async (req, res, next) => {
  try {
    const { filter: dateFilter, error } = buildAnalyticsFilter(req.query, req.user);
    if (error) {
      return res.status(400).json({ message: error });
    }

    const complaints = await Complaint.find(dateFilter)
      .populate('citizenId', 'name email')
      .populate('assignedAuthorityId', 'name email')
      .sort({ createdAt: -1 });

    const header = [
      'Complaint ID',
      'Title',
      'Category',
      'Status',
      'Location',
      'Citizen Name',
      'Citizen Email',
      'Authority Name',
      'Created At',
      'Updated At',
    ];

    const rows = complaints.map((complaint) =>
      [
        complaint.complaintId,
        complaint.title,
        complaint.category,
        complaint.status,
        complaint.location,
        complaint.citizenId?.name,
        complaint.citizenId?.email,
        complaint.assignedAuthorityId?.name,
        complaint.createdAt?.toISOString(),
        complaint.updatedAt?.toISOString(),
      ]
        .map(csvEscape)
        .join(',')
    );

    const csv = [header.join(','), ...rows].join('\n');
    const filename = `cprs-complaints-${new Date().toISOString().slice(0, 10)}.csv`;

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(csv);
  } catch (err) {
    next(err);
  }
};
