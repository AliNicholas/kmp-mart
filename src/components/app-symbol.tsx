import React from 'react';
import { SymbolView as ExpoSymbolView } from 'expo-symbols';
import type { SymbolViewProps } from 'expo-symbols';

const MAPPING: Record<string, string> = {
  "arrow.clockwise": "refresh",
  "bag.fill": "shopping_bag",
  "banknote.fill": "payments",
  "bicycle": "directions_bike",
  "cart": "shopping_cart",
  "cart.badge.plus": "add_shopping_cart",
  "cart.fill": "shopping_cart",
  "chart.bar.xaxis": "bar_chart",
  "checkmark.circle.fill": "check_circle",
  "checkmark.seal.fill": "verified",
  "chevron.down": "expand_more",
  "chevron.right": "chevron_right",
  "clock.fill": "schedule",
  "creditcard.fill": "credit_card",
  "doc.on.doc": "content_copy",
  "doc.text": "description",
  "envelope.fill": "mail",
  "exclamationmark.triangle.fill": "warning",
  "forward.fill": "fast_forward",
  "gift.fill": "redeem",
  "hammer.fill": "build",
  "info.circle.fill": "info",
  "list.bullet.rectangle.fill": "list_alt",
  "list.bullet.rectangle.portrait.fill": "view_list",
  "lock.shield.fill": "security",
  "magnifyingglass": "search",
  "map.fill": "map",
  "mappin.and.ellipse": "location_on",
  "mappin.circle.fill": "location_on",
  "message.fill": "chat",
  "network": "language",
  "person.2.fill": "group",
  "person.3.fill": "groups",
  "person.crop.circle.badge.checkmark": "how_to_reg",
  "person.crop.circle.badge.exclamationmark": "account_circle",
  "person.crop.circle.badge.plus": "person_add",
  "person.fill": "person",
  "person.text.rectangle.fill": "badge",
  "phone.fill": "call",
  "plus": "add",
  "qrcode": "qr_code",
  "questionmark.circle": "help",
  "rectangle.portrait.and.arrow.right": "logout",
  "safari": "explore",
  "shippingbox": "inventory_2",
  "shippingbox.fill": "inventory_2",
  "sparkles": "auto_awesome",
  "square.and.pencil": "edit",
  "star.fill": "star",
  "storefront.fill": "store",
  "trash": "delete",
  "tray": "inbox",
  "tray.and.arrow.down.fill": "move_to_inbox",
  "xmark": "close",
  "dot.radiowaves.up.forward": "wifi",
};

export function SymbolView({ name, ...props }: SymbolViewProps) {
  let mappedName: any;
  if (typeof name === 'string') {
    const androidWebSymbol = MAPPING[name] || 'help';
    mappedName = {
      ios: name,
      android: androidWebSymbol,
      web: androidWebSymbol,
    };
  } else {
    mappedName = name;
  }

  return <ExpoSymbolView name={mappedName} {...props} />;
}
