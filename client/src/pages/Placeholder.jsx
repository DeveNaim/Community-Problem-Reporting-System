import ErrorPage from './ErrorPage.jsx';

export default function Placeholder({ title = 'Page Not Found', stage, onRetry }) {
  return (
    <ErrorPage
      statusCode={404}
      title={title}
      message={
        stage
          ? `This section (${stage}) is currently unavailable. Click Retry below or return to the dashboard.`
          : undefined
      }
      onRetry={onRetry}
    />
  );
}
