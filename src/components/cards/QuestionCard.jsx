// ✅ UPGRADED: Using elite Heroicons 2
import { HiBookmark, HiChatBubbleLeftEllipsis } from "react-icons/hi2";
import { Link } from "react-router-dom";
import TechBadge from "../common/TechBadge";
import DifficultyBadge from "../common/DifficultyBadge";

const QuestionCard = ({ question, basePath = "/dashboard" }) => {
  return (
    <Link
      to={`${basePath}/questions/${question.id}`}
      className="block bg-white border border-black/8 rounded-2xl p-6 hover:border-blue-200 hover:-translate-y-1 hover:shadow-lg transition-all duration-250 cursor-pointer"
    >
      <div className="flex items-start justify-between mb-3">
        <TechBadge tech={question.technology} />
        <HiBookmark
          size={16}
          className="text-gray-300 hover:text-blue-500 transition-colors cursor-pointer mt-1"
        />
      </div>
      <h3 className="text-sm font-semibold text-[#0A1628] leading-snug mb-3 line-clamp-2">
        {question.title}
      </h3>
      <div className="flex items-center justify-between mt-4">
        <DifficultyBadge difficulty={question.difficulty} />
        <div className="flex items-center gap-1 text-gray-400 text-xs">
          <HiChatBubbleLeftEllipsis size={13} />
          <span>{question.answerCount || 0} answers</span>
        </div>
      </div>
    </Link>
  );
};

export default QuestionCard;
