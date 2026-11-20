export const ROLES = [
  { value: "wicketkeeper", label: "ವಿಕೆಟ್‌ಕೀಪರ್" },
  { value: "batsman", label: "ಬ್ಯಾಟ್ಸ್‌ಮನ್" },
  { value: "bowler", label: "ಬೌಲರ್" },
  { value: "allrounder", label: "ಆಲ್‌ರೌಂಡರ್" },
];
export const roleLabel = (v) => ROLES.find((r) => r.value === v)?.label || v || "—";

export const JERSEY_SIZES = ["XXS", "XS", "S", "M", "L", "XL", "XXL", "XXXL", "XXXXL"];

export const MAX_PHOTO_BYTES = 2 * 1024 * 1024;
export const PHOTO_TYPES = ["image/png", "image/jpeg"];
export const PHOTO_BUCKET = "player-photos";

// Phone photos are often 3-8 MB: accept up to this size and shrink automatically to under MAX_PHOTO_BYTES
export const MAX_ORIGINAL_BYTES = 25 * 1024 * 1024;
