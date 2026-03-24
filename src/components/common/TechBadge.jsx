const techStyles = {
  Java: "bg-amber-100 text-amber-800",
  "Spring Boot": "bg-green-100 text-green-800",
  React: "bg-blue-100 text-blue-800",
  JavaScript: "bg-yellow-100 text-yellow-800",
  TypeScript: "bg-blue-100 text-blue-900",
  Python: "bg-purple-100 text-purple-800",
  DevOps: "bg-emerald-100 text-emerald-800",
  Salesforce: "bg-red-100 text-red-800",
  SQL: "bg-orange-100 text-orange-800",
  Other: "bg-gray-100 text-gray-700",
};

const TechBadge = ({ tech }) => {
  const style = techStyles[tech] || techStyles["Other"];
  return (
    <span
      className={`text-xs font-semibold px-2.5 py-1 rounded-md uppercase tracking-wide ${style}`}
    >
      {tech}
    </span>
  );
};

export default TechBadge;
