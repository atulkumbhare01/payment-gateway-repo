interface Props {
  status: string;
  error: string | null;
  attempts: number;
  retry: boolean;
  onRetry: () => void;
}

export default function PaymentStatus({
  status,
  error,
  attempts,
  retry,
  onRetry,
}: Props) {
  return (
    <div className="status-box">
      <h2>{status}</h2>

      {status === "PROCESSING" && (
        <p>Processing payment...</p>
      )}

      {status === "SUCCESS" && (
        <p>Payment Successful</p>
      )}

      {status === "FAILED" && (
        <p>{error}</p>
      )}

      {status === "TIMEOUT" && (
        <p>Request Timeout</p>
      )}

      {(status === "FAILED" ||
        status === "TIMEOUT") && (
        <>
          <p>Attempt {attempts} of 3</p>

          {retry ? (
            <button onClick={onRetry}>
              Retry Payment
            </button>
          ) : (
            <p>
              Maximum retry attempts reached
            </p>
          )}
        </>
      )}
    </div>
  );
}