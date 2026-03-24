const styles = {
  ADMIN: "bg-[#0A1628] text-white",
  TUTOR: "bg-blue-600 text-white",
  EMPLOYEE: "bg-teal-600 text-white",
  SUBSCRIBER: "bg-purple-600 text-white",
};

const RoleBadge = ({ role }) => {
  const style = styles[role] || "bg-gray-200 text-gray-700";
  return (
    <span className={`text-xs font-semibold px-3 py-1 rounded-full ${style}`}>
      {role}
    </span>
  );
};

export default RoleBadge;
