import {
  formatWibDateTime,
  getOrderStatusHighlight,
  getOrderStatusLabel,
} from "@/lib/utils";
import { OrderStatusHistory } from "@/utils/db";
import { Text, View } from "react-native";

interface OrderStatusHistoryCardsProps {
  history: OrderStatusHistory[];
}

export function OrderStatusHistoryCards({
  history,
}: OrderStatusHistoryCardsProps) {
  if (history.length === 0) {
    return (
      <Text className="text-stone-400 text-[9px] italic mb-3">
        Belum ada perubahan status setelah pesanan dibuat.
      </Text>
    );
  }

  return (
    <View className="gap-2 mb-3">
      {history.map((item) => {
        const highlight = getOrderStatusHighlight(item.status);

        return (
          <View
            key={item.id}
            className={`border rounded-xl p-3 ${highlight.container}`}
          >
            <Text className={`text-[10px] font-bold ${highlight.label}`}>
              {getOrderStatusLabel(item.status)}
            </Text>
            <Text className={`text-[10px] mt-0.5 ${highlight.time}`}>
              {formatWibDateTime(item.changed_at)}
            </Text>
          </View>
        );
      })}
    </View>
  );
}
