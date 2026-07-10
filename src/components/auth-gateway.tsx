import { SymbolView } from "@/components/app-symbol";
import RegistrationModal from "@/components/registration-modal";
import { useApp } from "@/contexts/AppContext";
import * as React from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const fieldClass =
  "bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-3 text-sm text-stone-900";

export default function AuthGateway() {
  const { login, handleSwitchRole, resetAllData } = useApp();
  const [phone, setPhone] = React.useState("");
  const [pin, setPin] = React.useState("");
  const [error, setError] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [registrationOpen, setRegistrationOpen] = React.useState(false);
  const [devToolsOpen, setDevToolsOpen] = React.useState(false);

  const handleLogin = async () => {
    setIsSubmitting(true);
    setError("");
    const result = await login(phone, pin);
    setIsSubmitting(false);

    if (!result.success) {
      setError(result.error || "Login gagal. Coba lagi.");
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-emerald-950">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
      >
        <ScrollView
          contentContainerClassName="flex-grow justify-center px-5 py-8"
          keyboardShouldPersistTaps="handled"
        >
          <View className="w-full max-w-md self-center">
            <View className="mb-6">
              <View className="flex-row justify-between items-center mb-4">
                <View className="flex-row items-center gap-2.5">
                  <View className="bg-amber-400 size-11 rounded-2xl items-center justify-center shadow-sm">
                    <SymbolView
                      name="cart.fill"
                      size={21}
                      tintColor="#064e3b"
                    />
                  </View>
                  <View>
                    <Text className="text-white text-2xl font-black tracking-tight">
                      KMP <Text className="text-amber-400">Mart</Text>
                    </Text>
                    <Text className="text-emerald-200 text-[10px] font-bold tracking-wider uppercase">
                      Koperasi dekat, belanja mudah
                    </Text>
                  </View>
                </View>

                {/* Floating/Header Switcher Button */}
                <Pressable
                  onPress={() => setDevToolsOpen(true)}
                  className="bg-emerald-900 border border-emerald-800 flex-row items-center gap-1.5 px-3 py-1.5 rounded-full active:opacity-85"
                >
                  <SymbolView
                    name="hammer.fill"
                    size={10}
                    tintColor="#fbbf24"
                  />
                  <Text className="text-white text-[9px] font-black uppercase tracking-wider">
                    Demo
                  </Text>
                </Pressable>
              </View>

              <Text className="text-emerald-100 text-base leading-6">
                Masuk dengan nomor HP dan PIN untuk membuka kartu anggota serta
                layanan koperasi Anda.
              </Text>
            </View>

            <View className="bg-white rounded-3xl p-5 shadow-xl shadow-black/20">
              <View className="flex-row items-start gap-3 pb-4 border-b border-stone-100">
                <View className="bg-emerald-100 size-10 rounded-xl items-center justify-center">
                  <SymbolView
                    name="person.text.rectangle.fill"
                    size={19}
                    tintColor="#047857"
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-emerald-950 text-lg font-black">
                    Masuk ke akun
                  </Text>
                  <Text className="text-stone-500 text-[11px] mt-0.5 leading-4">
                    Gunakan data yang dipakai saat pendaftaran.
                  </Text>
                </View>
              </View>

              <View className="mt-5 gap-3">
                <View>
                  <Text className="text-stone-700 text-[10px] font-black uppercase tracking-wide mb-1.5">
                    Nomor HP
                  </Text>
                  <TextInput
                    value={phone}
                    onChangeText={setPhone}
                    keyboardType="phone-pad"
                    textContentType="telephoneNumber"
                    autoComplete="tel"
                    placeholder="Contoh: 0812 3456 7890"
                    placeholderTextColor="#a8a29e"
                    className={fieldClass}
                  />
                </View>

                <View>
                  <Text className="text-stone-700 text-[10px] font-black uppercase tracking-wide mb-1.5">
                    PIN 6 digit
                  </Text>
                  <TextInput
                    value={pin}
                    onChangeText={setPin}
                    keyboardType="number-pad"
                    textContentType="password"
                    autoComplete="current-password"
                    secureTextEntry
                    maxLength={6}
                    placeholder="••••••"
                    placeholderTextColor="#a8a29e"
                    className={fieldClass}
                    onSubmitEditing={handleLogin}
                  />
                </View>

                {error ? (
                  <View className="bg-rose-50 border border-rose-200 rounded-xl px-3 py-2.5">
                    <Text className="text-rose-700 text-[11px] font-semibold">
                      {error}
                    </Text>
                  </View>
                ) : null}

                <Pressable
                  onPress={handleLogin}
                  disabled={isSubmitting}
                  className="bg-emerald-700 active:bg-emerald-800 rounded-xl py-3.5 items-center justify-center mt-1"
                >
                  {isSubmitting ? (
                    <ActivityIndicator size="small" color="#ffffff" />
                  ) : (
                    <Text className="text-white text-sm font-black">Masuk</Text>
                  )}
                </Pressable>
              </View>

              <View className="flex-row items-center my-5 gap-3">
                <View className="flex-1 h-px bg-stone-200" />
                <Text className="text-stone-400 text-[10px] font-bold">
                  BELUM PUNYA AKUN?
                </Text>
                <View className="flex-1 h-px bg-stone-200" />
              </View>

              <Pressable
                onPress={() => setRegistrationOpen(true)}
                className="border border-amber-400 bg-amber-50 active:bg-amber-100 rounded-xl py-3 flex-row items-center justify-center gap-2"
              >
                <SymbolView
                  name="person.crop.circle.badge.plus"
                  size={16}
                  tintColor="#92400e"
                />
                <Text className="text-amber-900 text-sm font-black">
                  Daftar sebagai warga
                </Text>
              </Pressable>

              <View className="mt-5 bg-stone-100 rounded-xl px-3.5 py-3 flex-row gap-2.5">
                <SymbolView
                  name="info.circle.fill"
                  size={15}
                  tintColor="#78716c"
                />
                <Text className="flex-1 text-stone-600 text-[10px] leading-4">
                  Akun demo: Dinda — 081234567890, PIN 123456.
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <RegistrationModal
        visible={registrationOpen}
        onClose={() => setRegistrationOpen(false)}
      />

      {/* DevTools Modal Sheet */}
      <Modal
        visible={devToolsOpen}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setDevToolsOpen(false)}
      >
        <Pressable
          onPress={() => setDevToolsOpen(false)}
          className="flex-1 justify-end bg-black/60"
        >
          <Pressable
            onPress={() => {}}
            className="bg-stone-900 rounded-t-3xl p-5 w-full border-t border-stone-800"
          >
            <View className="flex-row justify-between items-center border-b border-stone-800 pb-3 mb-4">
              <View className="flex-row items-center gap-2">
                <SymbolView name="hammer.fill" size={14} tintColor="#fbbf24" />
                <Text className="text-white font-extrabold text-sm">
                  KMP Mart Demo DevTools
                </Text>
              </View>
              <Pressable
                onPress={() => setDevToolsOpen(false)}
                className="p-1 rounded-full bg-stone-800 active:bg-stone-700"
              >
                <SymbolView name="xmark" size={14} tintColor="#aaa" />
              </Pressable>
            </View>

            <Text className="text-stone-400 text-[10px] mb-3 uppercase tracking-wider font-bold">
              Pilih Identitas Demo (Juri Pitching):
            </Text>

            <ScrollView className="max-h-[320px] mb-4">
              {/* Dinda - USER */}
              <Pressable
                onPress={async () => {
                  await handleSwitchRole("user-dinda", "USER", "Dinda");
                  setDevToolsOpen(false);
                }}
                className="flex-row items-center gap-3 p-3 rounded-xl bg-stone-800 border border-stone-700 mb-2 active:bg-stone-700"
              >
                <View className="bg-emerald-900/50 p-2 rounded-lg border border-emerald-800">
                  <SymbolView
                    name="person.fill"
                    size={16}
                    tintColor="#10b981"
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-white font-bold text-xs">
                    Dinda (Warga Digital)
                  </Text>
                  <Text className="text-stone-400 text-[9px] mt-0.5">
                    Role: USER • Sembako, gotong-royong, referral, poin.
                  </Text>
                </View>
              </Pressable>

              {/* Mas Arif - ADMIN */}
              <Pressable
                onPress={async () => {
                  await handleSwitchRole("user-arif", "ADMIN", "Mas Arif");
                  setDevToolsOpen(false);
                }}
                className="flex-row items-center gap-3 p-3 rounded-xl bg-stone-800 border border-stone-700 mb-2 active:bg-stone-700"
              >
                <View className="bg-rose-900/50 p-2 rounded-lg border border-rose-800">
                  <SymbolView
                    name="lock.shield.fill"
                    size={16}
                    tintColor="#ef4444"
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-white font-bold text-xs">
                    Mas Arif (Superadmin)
                  </Text>
                  <Text className="text-stone-400 text-[9px] mt-0.5">
                    Role: ADMIN • Semua menu: Gudang, Kas, Sourcing, Dispatch,
                    Layanan.
                  </Text>
                </View>
              </Pressable>

              {/* Mbak Rina - OPERASIONAL */}
              <Pressable
                onPress={async () => {
                  await handleSwitchRole(
                    "user-rina",
                    "OPERASIONAL",
                    "Mbak Rina",
                  );
                  setDevToolsOpen(false);
                }}
                className="flex-row items-center gap-3 p-3 rounded-xl bg-stone-800 border border-stone-700 mb-2 active:bg-stone-700"
              >
                <View className="bg-emerald-900/50 p-2 rounded-lg border border-emerald-800">
                  <SymbolView
                    name="shippingbox.fill"
                    size={16}
                    tintColor="#10b981"
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-white font-bold text-xs">
                    Mbak Rina (Operasional Koperasi)
                  </Text>
                  <Text className="text-stone-400 text-[9px] mt-0.5">
                    Role: OPERASIONAL • Gudang, Fulfillment, Dispatch, Layanan
                    Warga.
                  </Text>
                </View>
              </Pressable>

              {/* Mang Ujang - DRIVER */}
              <Pressable
                onPress={async () => {
                  await handleSwitchRole("user-ujang", "DRIVER", "Mang Ujang");
                  setDevToolsOpen(false);
                }}
                className="flex-row items-center gap-3 p-3 rounded-xl bg-stone-800 border border-stone-700 mb-2 active:bg-stone-700"
              >
                <View className="bg-blue-900/50 p-2 rounded-lg border border-blue-800">
                  <SymbolView
                    name="shippingbox.fill"
                    size={16}
                    tintColor="#3b82f6"
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-white font-bold text-xs">
                    Mang Ujang (KopKurir/Driver)
                  </Text>
                  <Text className="text-stone-400 text-[9px] mt-0.5">
                    Role: DRIVER • Ambil kiriman koperasi, antar ke warga, COD.
                  </Text>
                </View>
              </Pressable>

              {/* Bu Sari - AGENT */}
              <Pressable
                onPress={async () => {
                  await handleSwitchRole("user-sari", "AGENT", "Bu Sari");
                  setDevToolsOpen(false);
                }}
                className="flex-row items-center gap-3 p-3 rounded-xl bg-stone-800 border border-stone-700 mb-2 active:bg-stone-700"
              >
                <View className="bg-amber-900/50 p-2 rounded-lg border border-amber-800">
                  <SymbolView name="cart.fill" size={16} tintColor="#fbbf24" />
                </View>
                <View className="flex-1">
                  <Text className="text-white font-bold text-xs">
                    Bu Sari (Mitra Agen/Warung)
                  </Text>
                  <Text className="text-stone-400 text-[9px] mt-0.5">
                    Role: AGENT • Belanja grosir B2B, terima pengiriman, catat
                    demand warga.
                  </Text>
                </View>
              </Pressable>

              {/* Pak Slamet - SUPPLIER */}
              <Pressable
                onPress={async () => {
                  await handleSwitchRole(
                    "user-slamet",
                    "SUPPLIER",
                    "Pak Slamet",
                  );
                  setDevToolsOpen(false);
                }}
                className="flex-row items-center gap-3 p-3 rounded-xl bg-stone-800 border border-stone-700 mb-2 active:bg-stone-700"
              >
                <View className="bg-cyan-900/50 p-2 rounded-lg border border-cyan-800">
                  <SymbolView
                    name="envelope.fill"
                    size={16}
                    tintColor="#22d3ee"
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-white font-bold text-xs">
                    Pak Slamet (Mitra Supplier)
                  </Text>
                  <Text className="text-stone-400 text-[9px] mt-0.5">
                    Role: SUPPLIER • Lihat PO masuk dari koperasi, konfirmasi
                    pengiriman barang.
                  </Text>
                </View>
              </Pressable>
            </ScrollView>

            <View className="border-t border-stone-800 pt-4 flex-row gap-2">
              <Pressable
                onPress={async () => {
                  await resetAllData();
                  setDevToolsOpen(false);
                  Alert.alert("Sukses", "Data demo berhasil di-reset.");
                }}
                className="flex-1 bg-stone-800 border border-stone-700 py-3 rounded-xl items-center justify-center active:bg-stone-700 flex-row gap-2"
              >
                <SymbolView
                  name="arrow.clockwise"
                  size={12}
                  tintColor="#fbbf24"
                />
                <Text className="text-amber-400 font-bold text-xs">
                  Reset Demo Data
                </Text>
              </Pressable>

              <Pressable
                onPress={() => setDevToolsOpen(false)}
                className="flex-1 bg-emerald-800 border border-emerald-900 py-3 rounded-xl items-center justify-center active:bg-emerald-900"
              >
                <Text className="text-white font-bold text-xs">Tutup</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}
