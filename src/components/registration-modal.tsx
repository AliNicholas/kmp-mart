import { REGISTRATION_DEMO_OTP, RegisterCitizenInput, useApp } from '@/contexts/AppContext';
import { SymbolView } from 'expo-symbols';
import React from 'react';
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
} from 'react-native';

interface RegistrationModalProps {
  visible: boolean;
  onClose: () => void;
}



const fieldClass = 'bg-white border border-stone-200 rounded-xl px-3 py-2.5 text-xs text-stone-900';
const labelClass = 'text-stone-700 text-[10px] font-black uppercase tracking-wide mb-1';

export default function RegistrationModal({ visible, onClose }: RegistrationModalProps) {
  const { registerCitizen, allUsers } = useApp();

  const [step, setStep] = React.useState<0 | 1 | 2>(0);
  const [fullName, setFullName] = React.useState('Siti Aminah');
  const [nik, setNik] = React.useState('3275011508900001');
  const [phone, setPhone] = React.useState('081298765432');
  const [address, setAddress] = React.useState('Jl. Merah Putih No. 17, Desa Sukamaju');
  const rt = '00';
  const [rw, setRw] = React.useState('02');
  const cooperativeId = 'tenant-1';
  const [referralCode, setReferralCode] = React.useState('');
  const [otp, setOtp] = React.useState('');
  const [pin, setPin] = React.useState('');
  const [confirmPin, setConfirmPin] = React.useState('');
  const [error, setError] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const resetFlow = () => {
    setStep(0);
    setOtp('');
    setPin('');
    setConfirmPin('');
    setError('');
    setIsSubmitting(false);
  };

  const handleClose = () => {
    if (isSubmitting) return;
    resetFlow();
    onClose();
  };

  const validateProfile = () => {
    if (fullName.trim().length < 3) return 'Nama sesuai KTP minimal 3 karakter.';
    if (nik.replace(/\D/g, '').length !== 16) return 'NIK KTP harus 16 digit.';
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length < 10 || cleanPhone.length > 13) return 'Nomor HP belum valid.';
    if (!address.trim()) return 'Alamat KTP wajib diisi.';
    if (!rw.replace(/\D/g, '')) return 'RW wajib diisi.';
    if (!referralCode.trim()) return 'Kode KopAjak wajib diisi.';

    // Check if the referral code exists in the database
    const cleanReferral = referralCode.trim().toUpperCase();
    const referrer = allUsers.find(u => u.referral_code === cleanReferral);
    if (!referrer) return 'Kode KopAjak tidak ditemukan.';

    return '';
  };

  const handleSendOtp = () => {
    const validationError = validateProfile();
    if (validationError) {
      setError(validationError);
      return;
    }

    setError('');
    setStep(1);
  };

  const handleVerifyOtp = () => {
    if (otp.trim() !== REGISTRATION_DEMO_OTP) {
      setError('Kode OTP tidak sesuai.');
      return;
    }

    setError('');
    setStep(2);
  };

  const handleRegister = async () => {
    if (!/^\d{6}$/.test(pin)) {
      setError('PIN harus 6 digit angka.');
      return;
    }

    if (pin !== confirmPin) {
      setError('Konfirmasi PIN belum sama.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    const payload: RegisterCitizenInput = {
      fullName,
      nik,
      phone,
      address,
      rt,
      rw,
      cooperativeId,
      referralCode,
      otp,
      pin,
    };

    const result = await registerCitizen(payload);
    setIsSubmitting(false);

    if (!result.success) {
      setError(result.error || 'Registrasi gagal.');
      return;
    }

    Alert.alert(
      'Registrasi aktif',
      `Kartu Kopdes ${result.user?.member_id || ''} siap dipakai untuk belanja koperasi.`
    );
    resetFlow();
    onClose();
  };

  const renderProgress = () => (
    <View className="flex-row items-center gap-2 mb-4">
      {['Data KTP', 'OTP', 'PIN'].map((label, index) => {
        const isActive = step === index;
        const isDone = step > index;
        return (
          <View key={label} className="flex-1">
            <View
              className={`h-1.5 rounded-full mb-1 ${
                isDone ? 'bg-emerald-600' : isActive ? 'bg-amber-400' : 'bg-stone-200'
              }`}
            />
            <Text className={`text-[9px] font-bold ${isActive ? 'text-emerald-900' : 'text-stone-400'}`}>
              {label}
            </Text>
          </View>
        );
      })}
    </View>
  );

  const renderProfileStep = () => (
    <View className="gap-3">
      <View className="bg-emerald-950 rounded-2xl p-4 overflow-hidden">
        <View className="absolute right-0 top-0 bottom-0 w-20 bg-amber-400 opacity-20" />
        <Text className="text-amber-300 text-[9px] font-black tracking-widest uppercase">
          Pendaftaran Anggota Kopdes
        </Text>
        <Text className="text-white font-black text-lg mt-1">Data warga sesuai KTP</Text>
        <Text className="text-emerald-100 text-[10px] mt-1 leading-4">
          NIK hanya disimpan dalam bentuk tersamarkan untuk kartu dan audit demo.
        </Text>
      </View>

      <View>
        <Text className={labelClass}>Nama sesuai KTP</Text>
        <TextInput value={fullName} onChangeText={setFullName} className={fieldClass} placeholder="cth: Siti Aminah" />
      </View>

      <View>
        <Text className={labelClass}>NIK KTP</Text>
        <TextInput
          value={nik}
          onChangeText={setNik}
          keyboardType="numeric"
          maxLength={16}
          className={fieldClass}
          placeholder="3275011508900001"
        />
      </View>

      <View>
        <Text className={labelClass}>Nomor HP aktif</Text>
        <TextInput
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
          className={fieldClass}
          placeholder="0812..."
        />
      </View>

      <View>
        <Text className={labelClass}>Alamat KTP</Text>
        <TextInput
          value={address}
          onChangeText={setAddress}
          className={`${fieldClass} min-h-16`}
          multiline
          placeholder="Jl. Merah Putih No. 17, Desa Sukamaju"
        />
      </View>

      <View>
        <Text className={labelClass}>RW</Text>
        <TextInput value={rw} onChangeText={setRw} keyboardType="numeric" maxLength={2} className={fieldClass} />
      </View>

      <View className="mb-2">
        <Text className={labelClass}>Kode KopAjak (Wajib)</Text>
        <TextInput
          value={referralCode}
          onChangeText={setReferralCode}
          autoCapitalize="characters"
          className={fieldClass}
          placeholder="Masukkan kode KopAjak"
        />
      </View>

      <Pressable onPress={handleSendOtp} className="bg-emerald-700 border border-emerald-800 py-3 rounded-xl items-center active:bg-emerald-950 mt-2">
        <Text className="text-white text-xs font-black">Kirim OTP</Text>
      </Pressable>
    </View>
  );

  const renderOtpStep = () => (
    <View className="gap-3">
      <View className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
        <View className="flex-row items-center gap-2 mb-2">
          <SymbolView name="message.fill" size={16} tintColor="#b45309" />
          <Text className="text-amber-900 font-black text-sm">Verifikasi nomor HP</Text>
        </View>
        <Text className="text-amber-800 text-[10px] leading-4">
          Untuk demo hackathon, kode OTP ditampilkan langsung: {REGISTRATION_DEMO_OTP}
        </Text>
      </View>

      <View>
        <Text className={labelClass}>Kode OTP</Text>
        <TextInput
          value={otp}
          onChangeText={setOtp}
          keyboardType="numeric"
          maxLength={6}
          className={`${fieldClass} text-center text-base font-black tracking-widest`}
          placeholder="240826"
        />
      </View>

      <View className="flex-row gap-2">
        <Pressable onPress={() => setStep(0)} className="px-4 py-3 rounded-xl border border-stone-300 bg-white">
          <Text className="text-stone-600 text-xs font-bold">Kembali</Text>
        </Pressable>
        <Pressable onPress={handleVerifyOtp} className="flex-1 bg-emerald-700 border border-emerald-800 py-3 rounded-xl items-center active:bg-emerald-950">
          <Text className="text-white text-xs font-black">Verifikasi OTP</Text>
        </Pressable>
      </View>
    </View>
  );

  const renderPinStep = () => (
    <View className="gap-3">
      <View className="bg-stone-900 rounded-2xl p-4">
        <View className="flex-row items-center gap-2 mb-2">
          <SymbolView name="lock.shield.fill" size={16} tintColor="#fbbf24" />
          <Text className="text-white font-black text-sm">Buat PIN transaksi</Text>
        </View>
        <Text className="text-stone-300 text-[10px] leading-4">
          PIN dipakai saat warga belanja mandiri atau menggunakan Kartu Kopdes.
        </Text>
      </View>

      <View>
        <Text className={labelClass}>PIN 6 digit</Text>
        <TextInput
          value={pin}
          onChangeText={setPin}
          keyboardType="numeric"
          secureTextEntry
          maxLength={6}
          className={`${fieldClass} text-center text-base font-black tracking-widest`}
          placeholder="123456"
        />
      </View>

      <View>
        <Text className={labelClass}>Ulangi PIN</Text>
        <TextInput
          value={confirmPin}
          onChangeText={setConfirmPin}
          keyboardType="numeric"
          secureTextEntry
          maxLength={6}
          className={`${fieldClass} text-center text-base font-black tracking-widest`}
          placeholder="123456"
        />
      </View>

      <View className="bg-emerald-50 border border-emerald-100 rounded-xl p-3">
        <Text className="text-emerald-900 text-[10px] leading-4">
          Setelah aktif, warga langsung punya member ID, Kartu Kopdes QR token, dan kode KopAjak sendiri.
        </Text>
      </View>

      <View className="flex-row gap-2">
        <Pressable disabled={isSubmitting} onPress={() => setStep(1)} className="px-4 py-3 rounded-xl border border-stone-300 bg-white">
          <Text className="text-stone-600 text-xs font-bold">Kembali</Text>
        </Pressable>
        <Pressable
          disabled={isSubmitting}
          onPress={handleRegister}
          className="flex-1 bg-amber-400 border border-amber-500 py-3 rounded-xl items-center active:bg-amber-500"
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color="#064e3b" />
          ) : (
            <Text className="text-emerald-950 text-xs font-black">Aktifkan Anggota</Text>
          )}
        </Pressable>
      </View>
    </View>
  );

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1"
      >
        <Pressable
          onPress={handleClose}
          disabled={isSubmitting}
          className="flex-1 justify-end bg-black/60"
        >
          <Pressable onPress={() => {}} className="bg-stone-50 rounded-t-3xl max-h-[92%] w-full">
            <View className="px-5 pt-5 pb-3 border-b border-stone-200 bg-white rounded-t-3xl">
            <View className="flex-row justify-between items-start gap-3">
              <View className="flex-1">
                <Text className="text-emerald-950 font-black text-lg">Registrasi Warga</Text>
                <Text className="text-stone-500 text-[10px] mt-0.5">
                  Daftar anggota baru untuk belanja koperasi desa.
                </Text>
              </View>
              <Pressable onPress={handleClose} disabled={isSubmitting} className="p-1.5 rounded-full bg-stone-100">
                <SymbolView name="xmark" size={14} tintColor="#57534e" />
              </Pressable>
            </View>
          </View>

          <ScrollView contentContainerClassName="p-5 pb-8" keyboardShouldPersistTaps="handled">
            {renderProgress()}
            {error ? (
              <View className="bg-rose-50 border border-rose-200 rounded-xl p-3 mb-3">
                <Text className="text-rose-700 text-[10px] font-bold">{error}</Text>
              </View>
            ) : null}

            {step === 0 && renderProfileStep()}
            {step === 1 && renderOtpStep()}
            {step === 2 && renderPinStep()}
          </ScrollView>
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
}
