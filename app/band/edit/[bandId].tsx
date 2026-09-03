import { AnimatedPressable } from "@/components/AnimatedPressable";
import GenreBadges from "@/components/GenreBadges";
import InstrumentBadges from "@/components/InstrumentBadges";
import SelectGenresModal from "@/components/SelectGenresModal";
import SelectInstrumentsModal from "@/components/SelectInstrumentsModal";
import { COLORS } from "@/constants/Colors";
import { FONTS } from "@/constants/Fonts";
import { useBandProfile } from "@/hooks/useBandProfile";
import { bandsService } from "@/services/bandsService";
import { Band, Genre } from "@/types/Band.type";
import { Instrument } from "@/types/User.type";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import * as ImagePicker from "expo-image-picker";
import { router, useLocalSearchParams } from "expo-router";
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

const BAND_PICTURE_SIZE = 110;

const bandSchema = z.object({
  name: z.string().min(1, "Band name is required"),
  instrumentIds: z.array(z.number()).min(1, "Select at least one instrument"),
});

type BandFormData = z.infer<typeof bandSchema>;

function sameIds(a: number[], b: number[]): boolean {
  const sortedA = [...a].sort((x, y) => x - y);
  const sortedB = [...b].sort((x, y) => x - y);
  return JSON.stringify(sortedA) === JSON.stringify(sortedB);
}

export default function EditBandScreen() {
  const { bandId } = useLocalSearchParams<{ bandId: string }>();
  const queryClient = useQueryClient();

  const [hasInitialized, setHasInitialized] = useState(false);
  const [pictureUri, setPictureUri] = useState<string | null>(null);
  const [pictureChanged, setPictureChanged] = useState(false);
  const [selectedInstruments, setSelectedInstruments] = useState<Instrument[]>([]);
  const [instrumentsModalVisible, setInstrumentsModalVisible] = useState(false);
  const [selectedGenres, setSelectedGenres] = useState<Genre[]>([]);
  const [genresModalVisible, setGenresModalVisible] = useState(false);
  const [saving, setSaving] = useState(false);

  const {
    control,
    handleSubmit,
    setValue,
    getValues,
    reset,
    formState: { errors },
  } = useForm<BandFormData>({
    resolver: zodResolver(bandSchema),
    defaultValues: { name: "", instrumentIds: [] },
  });

  // Same query key/cache the band profile screen already populated, so this
  // screen renders instantly when navigated to from there.
  const { data: band, isLoading, error } = useBandProfile(bandId);

  // Seed local/form state from the loaded band exactly once — a background
  // refetch of the same query key must never clobber in-progress edits.
  useEffect(() => {
    if (band && !hasInitialized) {
      reset({ name: band.name, instrumentIds: band.requiredInstruments.map((i) => i.id) });
      setSelectedInstruments(band.requiredInstruments);
      setSelectedGenres(band.genres);
      setPictureUri(band.profilePicture);
      setHasInitialized(true);
    }
  }, [band, hasInitialized, reset]);

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

  const onSave = async (data: BandFormData) => {
    if (!band) return;
    setSaving(true);

    const failedFields: string[] = [];
    let anyChange = false;

    if (data.name !== band.name) {
      anyChange = true;
      try {
        await bandsService.updateBandName(band.id, data.name);
      } catch (err) {
        console.error("Error updating band name:", err);
        failedFields.push("name");
      }
    }

    if (!sameIds(data.instrumentIds, band.requiredInstruments.map((i) => i.id))) {
      anyChange = true;
      try {
        await bandsService.updateBandInstruments(band.id, data.instrumentIds);
      } catch (err) {
        console.error("Error updating band instruments:", err);
        failedFields.push("instruments");
      }
    }

    if (!sameIds(selectedGenres.map((g) => g.id), band.genres.map((g) => g.id))) {
      anyChange = true;
      try {
        await bandsService.updateBandGenres(band.id, selectedGenres.map((g) => g.id));
      } catch (err) {
        console.error("Error updating band genres:", err);
        failedFields.push("genres");
      }
    }

    if (pictureChanged && pictureUri) {
      anyChange = true;
      try {
        const pictureFormData = new FormData();
        pictureFormData.append("Picture", {
          uri: pictureUri,
          name: "band.jpg",
          type: "image/jpeg",
        } as any);
        await bandsService.updateBandPicture(band.id, pictureFormData);
      } catch (err) {
        console.error("Error updating band picture:", err);
        failedFields.push("picture");
      }
    }

    if (!anyChange) {
      setSaving(false);
      router.back();
      return;
    }

    try {
      const freshBand = await bandsService.getBand(band.id);
      queryClient.setQueryData<Band>(["bands", bandId], freshBand);
    } catch (err) {
      console.error("Error refreshing band after save:", err);
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
        text1: "Band updated",
      });
      setSaving(false);
      router.back();
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <View style={styles.header}>
        <AnimatedPressable onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={24} color={COLORS.lightBlueX2} />
        </AnimatedPressable>
        <Text style={styles.headerTitle}>Edit band</Text>
        <AnimatedPressable style={styles.saveButton} onPress={handleSubmit(onSave)}>
          {saving ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <Text style={styles.saveText}>Save</Text>
          )}
        </AnimatedPressable>
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.white} />
        </View>
      ) : error || !band ? (
        <View style={styles.center}>
          <Text style={styles.errorText}>{error?.message || "Error desconocido"}</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <AnimatedPressable style={styles.bandPicturePicker} onPress={pickPicture}>
            {pictureUri ? (
              <Image source={{ uri: pictureUri }} style={styles.bandPictureImage} />
            ) : (
              <View style={styles.placeholderContent}>
                <MaterialIcons name="photo-camera" size={28} color={COLORS.gray} />
              </View>
            )}
          </AnimatedPressable>

          <Controller
            control={control}
            name="name"
            render={({ field: { onChange, value } }) => (
                <TextInput
                  style={styles.nameInput}
                  placeholder="Band name"
                  placeholderTextColor={COLORS.gray}
                  value={value}
                  onChangeText={onChange}
                />
            )}
          />
          {errors.name && <Text style={styles.error}>{errors.name.message}</Text>}

          <AnimatedPressable
            style={styles.selectInstrumentsButton}
            onPress={() => setInstrumentsModalVisible(true)}
          >
            <Text style={styles.selectInstrumentsText}>Select instruments</Text>
          </AnimatedPressable>
          <InstrumentBadges instruments={selectedInstruments} />
          {errors.instrumentIds && <Text style={styles.error}>{errors.instrumentIds.message}</Text>}

          <AnimatedPressable
            style={styles.selectInstrumentsButton}
            onPress={() => setGenresModalVisible(true)}
          >
            <Text style={styles.selectInstrumentsText}>Select genres</Text>
          </AnimatedPressable>
          <GenreBadges genres={selectedGenres} />
        </ScrollView>
      )}

      <SelectInstrumentsModal
        visible={instrumentsModalVisible}
        selectedIds={getValues("instrumentIds")}
        onClose={() => setInstrumentsModalVisible(false)}
        onConfirm={(ids, instruments) => {
          setValue("instrumentIds", ids, { shouldValidate: true });
          setSelectedInstruments(instruments);
        }}
      />

      <SelectGenresModal
        visible={genresModalVisible}
        selectedIds={selectedGenres.map((g) => g.id)}
        onClose={() => setGenresModalVisible(false)}
        onConfirm={(_ids, genres) => {
          setSelectedGenres(genres);
        }}
      />
    </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
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

  errorText: {
    color: COLORS.white,
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

  bandPicturePicker: {
    alignSelf: "center",
    width: BAND_PICTURE_SIZE,
    height: BAND_PICTURE_SIZE,
    borderRadius: BAND_PICTURE_SIZE / 2,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: COLORS.gray,
    backgroundColor: COLORS.white,
    alignItems: "center",
    justifyContent: "center",
  },

  bandPictureImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },

  nameInput: {
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
