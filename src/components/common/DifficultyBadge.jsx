const styles = {
  EASY: "bg-green-100 text-green-700",
  MEDIUM: "bg-amber-100 text-amber-700",
  HARD: "bg-red-100 text-red-700",
};

const DifficultyBadge = ({ difficulty }) => {
  const style = styles[difficulty] || styles["EASY"];
  return (
    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${style}`}>
      {difficulty}
    </span>
  );
};

export default DifficultyBadge;
