import { AnimatedPressable } from "@/components/AnimatedPressable";
import InstrumentBadges from "@/components/InstrumentBadges";
import SelectInstrumentsModal from "@/components/SelectInstrumentsModal";
import { COLORS } from "@/constants/Colors";
import { FONTS } from "@/constants/Fonts";
import { useSession } from "@/contexts/AuthContext";
import { instrumentsService } from "@/services/instrumentsService";
import { usersService } from "@/services/usersService";
import { CurrentUser, Instrument } from "@/types/User.type";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { zodResolver } from "@hookform/resolvers/zod";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";

import { Controller, useForm } from "react-hook-form";
import {
  ActivityIndicator,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import Toast from "react-native-toast-message";
import { z } from "zod";

const PICTURE_SIZE = 110;
const MAX_INSTRUMENTS = 2;

const profileSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  userName: z.string().min(6, "Username must be at least 6 characters"),
});

type ProfileFormData = z.infer<typeof profileSchema>;

function sameIds(a: number[], b: number[]): boolean {
  const sortedA = [...a].sort((x, y) => x - y);
  const sortedB = [...b].sort((x, y) => x - y);
  return JSON.stringify(sortedA) === JSON.stringify(sortedB);
}

export default function EditProfileScreen() {
  const { currentUser, updateCurrentUser } = useSession();

  const [hasInitialized, setHasInitialized] = useState(false);
  const [pictureUri, setPictureUri] = useState<string | null>(null);
  const [pictureChanged, setPictureChanged] = useState(false);
  const [selectedInstruments, setSelectedInstruments] = useState<Instrument[]>([]);
  const [instrumentsModalVisible, setInstrumentsModalVisible] = useState(false);
  const [saving, setSaving] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: { firstName: "", lastName: "", userName: "" },
  });

  // Seed local/form state from the session's current user exactly once — a
  // background update to currentUser must never clobber in-progress edits.
  useEffect(() => {
    if (currentUser && !hasInitialized) {
      reset({
        firstName: currentUser.firstName ?? "",
        lastName: currentUser.lastName ?? "",
        userName: currentUser.userName ?? "",
      });
      setSelectedInstruments(currentUser.favoriteInstruments ?? []);
      setPictureUri(currentUser.profilePicture);
      setHasInitialized(true);
    }
  }, [currentUser, hasInitialized, reset]);

  const pickPicture = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.8,
      allowsEditing: true,
      aspect: [1, 1],
    });

    if (!result.canceled && result.assets.length > 0) {
      const asset = result.assets[0];
      setPictureUri(asset.uri ?? null);
      setPictureChanged(true);
    }
  };

  const onSave = async (data: ProfileFormData) => {
    if (!currentUser) return;
    setSaving(true);

    const failedFields: string[] = [];
    let anyChange = false;
    let latestUser: CurrentUser = currentUser as CurrentUser;

    if (
      data.firstName !== currentUser.firstName ||
      data.lastName !== currentUser.lastName ||
      data.userName !== currentUser.userName
    ) {
      anyChange = true;
      try {
        latestUser = await usersService.updateProfile({
          firstName: data.firstName,
          lastName: data.lastName,
          userName: data.userName,
        });
      } catch (err) {
        console.error("Error updating profile:", err);
        failedFields.push("profile");
      }
    }

    if (!sameIds(selectedInstruments.map((i) => i.id), (currentUser.favoriteInstruments ?? []).map((i) => i.id))) {
      anyChange = true;
      try {
        latestUser = await instrumentsService.updateMyInstruments(selectedInstruments.map((i) => i.id));
      } catch (err) {
        console.error("Error updating instruments:", err);
        failedFields.push("instruments");
      }
    }

    if (pictureChanged && pictureUri) {
      anyChange = true;
      try {
        const pictureFormData = new FormData();
        pictureFormData.append("newAvatar", {
          uri: pictureUri,
          name: "avatar.jpg",
          type: "image/jpeg",
        } as any);
        latestUser = await usersService.updateAvatar(pictureFormData);
      } catch (err) {
        console.error("Error updating avatar:", err);
        failedFields.push("picture");
      }
    }

    if (!anyChange) {
      setSaving(false);
      router.back();
      return;
    }

    if (latestUser !== currentUser) {
      updateCurrentUser(latestUser);
    }

    if (failedFields.length > 0) {
      Toast.show({
        type: "error",
        text1: "Some changes failed",
        text2: failedFields.join(", "),
      });
      setSaving(false);
    } else {
      Toast.show({
        type: "success",
        text1: "Profile updated",
      });
      setSaving(false);
      router.back();
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.screen}
      >
        <View style={styles.header}>
          <AnimatedPressable onPress={() => router.back()}>
            <MaterialIcons name="arrow-back" size={24} color={COLORS.lightBlueX2} />
          </AnimatedPressable>
          <Text style={styles.headerTitle}>Edit profile</Text>
          <AnimatedPressable style={styles.saveButton} onPress={handleSubmit(onSave)}>
            {saving ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <Text style={styles.saveText}>Save</Text>
            )}
          </AnimatedPressable>
        </View>

        {!currentUser ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={COLORS.white} />
          </View>
        ) : (
          <ScrollView style={styles.scroll} contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
            <AnimatedPressable style={styles.picturePicker} onPress={pickPicture}>
              {pictureUri ? (
                <Image source={{ uri: pictureUri }} style={styles.pictureImage} />
              ) : (
                <View style={styles.placeholderContent}>
                  <MaterialIcons name="photo-camera" size={28} color={COLORS.gray} />
                </View>
              )}
            </AnimatedPressable>

            <Controller
              control={control}
              name="firstName"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={styles.input}
                  placeholder="First name"
                  placeholderTextColor={COLORS.gray}
                  value={value}
                  onChangeText={onChange}
                />
              )}
            />
            {errors.firstName && <Text style={styles.error}>{errors.firstName.message}</Text>}

            <Controller
              control={control}
              name="lastName"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={styles.input}
                  placeholder="Last name"
                  placeholderTextColor={COLORS.gray}
                  value={value}
                  onChangeText={onChange}
                />
              )}
            />
            {errors.lastName && <Text style={styles.error}>{errors.lastName.message}</Text>}

            <Controller
              control={control}
              name="userName"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={styles.input}
                  placeholder="Username"
                  placeholderTextColor={COLORS.gray}
                  autoCapitalize="none"
                  value={value}
                  onChangeText={onChange}
                />
              )}
            />
            {errors.userName && <Text style={styles.error}>{errors.userName.message}</Text>}

            <AnimatedPressable
              style={styles.selectInstrumentsButton}
              onPress={() => setInstrumentsModalVisible(true)}
            >
              <Text style={styles.selectInstrumentsText}>Select instruments</Text>
            </AnimatedPressable>
            <InstrumentBadges instruments={selectedInstruments} />
          </ScrollView>
        )}

        <SelectInstrumentsModal
          visible={instrumentsModalVisible}
          selectedIds={selectedInstruments.map((i) => i.id)}
          maxSelected={MAX_INSTRUMENTS}
          onClose={() => setInstrumentsModalVisible(false)}
          onConfirm={(_ids, instruments) => {
            setSelectedInstruments(instruments);
          }}
        />
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.darkBlue,
  },

  scroll: {
    flex: 1,
  },

  header: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.gray,
    backgroundColor: COLORS.darkBlue,
    alignItems: "center",
    justifyContent: "space-between",
  },

  headerTitle: {
    fontFamily: FONTS.jetBrainsMono,
    fontSize: 18,
    color: COLORS.lightBlueX2,
  },

  saveButton: {
    backgroundColor: COLORS.lightBlueX2,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },

  saveText: {
    color: COLORS.white,
    fontFamily: FONTS.spaceMono,
  },

  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.darkBlue,
  },

  container: {
    padding: 20,
    backgroundColor: COLORS.darkBlue,
    gap: 12,
  },

  placeholderContent: {
    alignItems: "center",
    justifyContent: "center",
  },

  error: {
    color: COLORS.red,
    fontSize: 13,
    marginTop: 6,
  },

  picturePicker: {
    alignSelf: "center",
    width: PICTURE_SIZE,
    height: PICTURE_SIZE,
    borderRadius: PICTURE_SIZE / 2,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: COLORS.gray,
    backgroundColor: COLORS.white,
    alignItems: "center",
    justifyContent: "center",
  },

  pictureImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },

  input: {
    backgroundColor: COLORS.white,
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.gray,
    fontFamily: FONTS.spaceMono,
  },

  selectInstrumentsButton: {
    borderWidth: 1,
    borderColor: COLORS.lightBlueX2,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },

  selectInstrumentsText: {
    color: COLORS.lightBlueX2,
    fontFamily: FONTS.spaceMono,
  },
});
