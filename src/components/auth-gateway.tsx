import RegistrationModal from '@/components/registration-modal';
import { useApp } from '@/contexts/AppContext';
import { SymbolView } from '@/components/app-symbol';
import { Image } from 'expo-image';
import * as React from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const fieldClass = 'bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-3 text-sm text-stone-900';

export default function AuthGateway() {
  const { login } = useApp();
  const [phone, setPhone] = React.useState('');
  const [pin, setPin] = React.useState('');
  const [error, setError] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [registrationOpen, setRegistrationOpen] = React.useState(false);

  const handleLogin = async () => {
    setIsSubmitting(true);
    setError('');
    const result = await login(phone, pin);
    setIsSubmitting(false);

    if (!result.success) {
      setError(result.error || 'Login gagal. Coba lagi.');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-emerald-950">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1"
      >
        <ScrollView
          contentContainerClassName="flex-grow justify-center px-5 py-8"
          keyboardShouldPersistTaps="handled"
        >
          <View className="w-full max-w-md self-center">
            <View className="mb-6">
              <View className="flex-row items-center gap-2.5 mb-4">
                <View className="bg-white size-11 rounded-2xl items-center justify-center overflow-hidden shadow-sm">
                  <Image
                    source={require('../../kmp-mart-logo.png')}
                    contentFit="contain"
                    className="size-full"
                    accessibilityLabel="Logo KMP Mart"
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

              <Text className="text-emerald-100 text-base leading-6">
                Masuk dengan nomor HP dan PIN untuk membuka kartu anggota serta layanan koperasi Anda.
              </Text>
            </View>

            <View className="bg-white rounded-3xl p-5 shadow-xl shadow-black/20">
              <View className="flex-row items-start gap-3 pb-4 border-b border-stone-100">
                <View className="bg-emerald-100 size-10 rounded-xl items-center justify-center">
                  <SymbolView name="person.text.rectangle.fill" size={19} tintColor="#047857" />
                </View>
                <View className="flex-1">
                  <Text className="text-emerald-950 text-lg font-black">Masuk ke akun</Text>
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
                    <Text className="text-rose-700 text-[11px] font-semibold">{error}</Text>
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
                <Text className="text-stone-400 text-[10px] font-bold">BELUM PUNYA AKUN?</Text>
                <View className="flex-1 h-px bg-stone-200" />
              </View>

              <Pressable
                onPress={() => setRegistrationOpen(true)}
                className="border border-amber-400 bg-amber-50 active:bg-amber-100 rounded-xl py-3 flex-row items-center justify-center gap-2"
              >
                <SymbolView name="person.crop.circle.badge.plus" size={16} tintColor="#92400e" />
                <Text className="text-amber-900 text-sm font-black">Daftar sebagai warga</Text>
              </Pressable>

              <View className="mt-5 bg-stone-100 rounded-xl px-3.5 py-3 flex-row gap-2.5">
                <SymbolView name="info.circle.fill" size={15} tintColor="#78716c" />
                <Text className="flex-1 text-stone-600 text-[10px] leading-4">
                  Akun demo: Dinda — 081234567890, PIN 123456.
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <RegistrationModal visible={registrationOpen} onClose={() => setRegistrationOpen(false)} />
    </SafeAreaView>
  );
}
