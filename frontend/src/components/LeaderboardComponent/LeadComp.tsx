import { useState, useEffect } from "react";
import styles from "./LeadComp.module.scss";

interface Player {
  id: number;
  profilePicture: string;
  nickname: string;
  filterValue: number;
}

interface LeadCompProps {
  game: string;
  category: string;
}

const LeadComp = ({ game, category }: LeadCompProps) => {
  const [leaderboardData, setLeaderboardData] = useState<Player[]>([]);

  useEffect(() => {
    const API_URL = `http://localhost:3000/api/v1/leaderboard/${game}/${category}`;

    fetch(API_URL)
      .then((response) => response.json())
      .then((data) => setLeaderboardData(data))
      .catch((error) => console.error("Failed to fetch data: ", error));
  }, [game, category]);

  return (
    // <table className={styles.table}>
    //   <colgroup>
    //     <col />
    //     <col />
    //     <col />
    //     <col />
    //   </colgroup>

    //   <thead>
    //     <tr>
    //       <th className={styles.indx}>#</th>
    //       <th className={styles.profPic}>Profile</th>
    //       <th className={styles.nickname}>Nickname</th>
    //       <th className={styles.value}>Value</th>
    //     </tr>
    //   </thead>
    //   <tbody>
    //     {leaderboardData.map((player, index) => (
    //       <tr key={player.id}>
    //         <td className={styles.indx}>{index + 1}</td>
    //         <td className={styles.profPic}>
    //           <img
    //             src={player.profilePicture}
    //             alt={player.nickname}
    //             className={styles.img}
    //           />
    //         </td>
    //         <td className={styles.nickname}>{player.nickname}</td>
    //         <td className={styles.value}>{player.filterValue}</td>
    //       </tr>
    //     ))}
    //   </tbody>
    // </table>
    <div className={styles.container}>
      {/* <div className={styles.head}>
        <div className={styles.row}>
          <div className={styles.indx}></div>
          <div className={styles.profPic}></div>
          <div className={styles.nickname}></div>
          <div className={styles.value}></div>
        </div>
      </div> */}
      <div className={styles.body}>
        {leaderboardData.map((player, index) => (
          <div className={styles.row} key={player.id}>
            <div className={styles.indx}>{index + 1}</div>
            <div className={styles.profPic}>
              <img src={player.profilePicture} />
            </div>
            <div className={styles.nickname}>{player.nickname}</div>
            <div className={styles.filterValue}>{player.filterValue}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LeadComp;
