export const CATEGORIES = [
  { value: "ELECTRONICS", label: "Electronics", icon: "💻" },
  { value: "CLOTHING", label: "Clothing", icon: "👕" },
  { value: "BOOKS", label: "Books", icon: "📚" },
  { value: "TOOLS", label: "Tools", icon: "🔧" },
  { value: "FURNITURE", label: "Furniture", icon: "🛋️" },
  { value: "ART", label: "Art", icon: "🎨" },
  { value: "FOOD", label: "Food", icon: "🥗" },
  { value: "SERVICES", label: "Services", icon: "🤝" },
  { value: "SKILLS", label: "Skills", icon: "⭐" },
  { value: "EDUCATION", label: "Education", icon: "🎓" },
  { value: "EXPERIENCE", label: "Experience", icon: "🌟" },
  { value: "OUTDOORS", label: "Outdoors", icon: "🌿" },
  { value: "VEHICLES", label: "Vehicles", icon: "🚲" },
  { value: "OTHER", label: "Other", icon: "📦" },
] as const;

export const POST_TYPES = [
  { value: "ITEM", label: "Physical Item" },
  { value: "SKILL", label: "Skill" },
  { value: "EXPERIENCE", label: "Experience" },
  { value: "EXPERTISE", label: "Expertise/Knowledge" },
  { value: "OTHER", label: "Other" },
] as const;

export const POST_STATUSES = {
  ACTIVE: { label: "Active", color: "text-green-700 bg-green-100" },
  PENDING: { label: "Pending Trade", color: "text-amber-700 bg-amber-100" },
  TRADED: { label: "Traded", color: "text-gray-600 bg-gray-100" },
  REMOVED: { label: "Removed", color: "text-red-700 bg-red-100" },
} as const;

export const TRADE_REQUEST_STATUSES = {
  PENDING: { label: "Pending", color: "text-amber-700 bg-amber-100" },
  ACCEPTED: { label: "Accepted", color: "text-green-700 bg-green-100" },
  DECLINED: { label: "Declined", color: "text-red-700 bg-red-100" },
  CANCELLED: { label: "Cancelled", color: "text-gray-600 bg-gray-100" },
  COMPLETED: { label: "Completed", color: "text-blue-700 bg-blue-100" },
} as const;

export const MAX_KEYWORDS = 10;
export const MAX_IMAGES = 5;
