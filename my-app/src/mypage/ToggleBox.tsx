import { useState } from "react";
import RecentMeasureList from "./RecentMeasureList";
import PostsByAuthor from "../components/PostsByAuthor";
interface ToggleBoxProps {
  userId: string | undefined;
}
const ToggleBox: React.FC<ToggleBoxProps> = ({ userId }) => {
  const [active, setActive] = useState<"최근활동" | "업적">("최근활동");

  return (
    <div
      style={{
        border: "2px solid #333",
        width: "100%",
        maxWidth: "400px",
        height: "200px",
        padding: "10px",
        boxSizing: "border-box",
      }}
    >
      <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
        {["최근활동", "업적"].map((label) => (
          <button
            key={label}
            onClick={() => setActive(label as "최근활동" | "업적")}
            style={{
              padding: "6px 12px",
              border: "1px solid",
              borderColor: active === label ? "#007bff" : "#ccc",
              backgroundColor: active === label ? "#007bff" : "#f0f0f0",
              color: active === label ? "#fff" : "#000",
              fontWeight: active === label ? "bold" : "normal",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            {label}
          </button>
        ))}
      </div>
      <div>
        {active === "최근활동" ? (
          <div>
            <RecentMeasureList userId={userId || ""} />
            <PostsByAuthor userId={userId} />
          </div>
        ) : (
          <div>B 내용</div>
        )}
        {}
      </div>
    </div>
  );
};

export default ToggleBox;
