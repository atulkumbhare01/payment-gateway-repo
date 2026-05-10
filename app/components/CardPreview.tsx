interface Props {
  number: string;
  name: string;
  expiry: string;
  cardType: string;
}

export default function CardPreview({
  number,
  name,
  expiry,
  cardType,
}: Props) {
  return (
    <div className="card">
      <div className="card-type">{cardType}</div>

      <h2>
        {number || "XXXX XXXX XXXX XXXX"}
      </h2>

      <div className="card-footer">
        <div>
          <small>Card Holder</small>
          <p>{name || "YOUR NAME"}</p>
        </div>

        <div>
          <small>Expiry</small>
          <p>{expiry || "MM/YY"}</p>
        </div>
      </div>
    </div>
  );
}