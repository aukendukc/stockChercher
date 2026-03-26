import type { FC } from "react";

import profilePic from "../src/assets/stockspace_icon_clean.png";
import "./profile.css";

export const Profile: FC = () => {
  return (
    <div className="profile-container">
      <div className="profile-frame">
        <img src={profilePic} alt="StockSpace icon" className="profile-pic" />
      </div>
    </div>
  );
};
