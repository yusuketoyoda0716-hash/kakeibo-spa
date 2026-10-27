import {
  Utensils, ShoppingBasket, TrainFront, House, Lightbulb, Wifi,
  Gamepad2, Stethoscope, Scissors, Wallet, Tag,
} from "lucide-react";

// カテゴリ名に含まれる言葉からアイコンを選ぶ（ユーザーが追加したカテゴリにも当てはまるように）
const RULES = [
  [/食|外食|ランチ|カフェ/, Utensils],
  [/日用|消耗/, ShoppingBasket],
  [/交通|電車|バス|タクシー/, TrainFront],
  [/家賃|住/, House],
  [/光熱|電気|ガス|水道/, Lightbulb],
  [/通信|ネット|スマホ/, Wifi],
  [/娯楽|趣味|遊/, Gamepad2],
  [/医療|病院|薬/, Stethoscope],
  [/美容|服/, Scissors],
  [/給与|給料|収入|ボーナス/, Wallet],
];

export default function CategoryIcon({ name, size = 18 }) {
  const Icon = RULES.find(([re]) => re.test(String(name || "")))?.[1] ?? Tag;
  return <Icon size={size} strokeWidth={1.75} aria-hidden="true" />;
}
