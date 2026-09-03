import { AnimatedPressable } from "@/components/AnimatedPressable";
import InstrumentBadges from "@/components/InstrumentBadges";
import SelectInstrumentsModal from "@/components/SelectInstrumentsModal";
import { COLORS } from "@/constants/Colors";
import { FONTS } from "@/constants/Fonts";
import { bandsService } from "@/services/bandsService";
import { postsService } from "@/services/postsService";
import { Instrument } from "@/types/User.type";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import * as ImagePicker from "expo-image-picker";
import { useIsFocused, useRouter } from "expo-router";
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

const postSchema = z.object({
  caption: z.string().min(1, "Caption is required"),
  image: z.string().min(1, "Image is required"),
});

type PostFormData = z.infer<typeof postSchema>;

const bandSchema = z.object({
  name: z.string().min(1, "Band name is required"),
  instrumentIds: z.array(z.number()).min(1, "Select at least one instrument"),
});

type BandFormData = z.infer<typeof bandSchema>;

type Mode = "post" | "band";

export default function CreateScreen() {
  const [mode, setMode] = useState<Mode>("post");
  const [previewUri, setPreviewUri] = useState<string | null>(null);
  const [bandPictureUri, setBandPictureUri] = useState<string | null>(null);
  const [selectedInstruments, setSelectedInstruments] = useState<Instrument[]>([]);
  const [instrumentsModalVisible, setInstrumentsModalVisible] = useState(false);
  const [loading, setLoading] = useState<boolean>(false);

  const router = useRouter();
  const isFocused = useIsFocused();
  const queryClient = useQueryClient();

  const {
    control: postControl,
    handleSubmit: handlePostSubmit,
    setValue: setPostValue,
    reset: resetPostForm,
    formState: { errors: postErrors },
  } = useForm<PostFormData>({
    resolver: zodResolver(postSchema),
    defaultValues: { caption: "", image: "" },
  });

  const {
    control: bandControl,
    handleSubmit: handleBandSubmit,
    setValue: setBandValue,
    getValues: getBandValues,
    reset: resetBandForm,
    formState: { errors: bandErrors },
  } = useForm<BandFormData>({
    resolver: zodResolver(bandSchema),
    defaultValues: { name: "", instrumentIds: [] },
  });

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.8,
      allowsEditing: true,
      aspect: [3, 2],
    });

    if (!result.canceled && result.assets.length > 0) {
      const asset = result.assets[0];
      setPostValue("image", asset.uri ?? "");
      setPreviewUri(asset.uri ?? null);
    }
  };

  const pickBandPicture = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.8,
      allowsEditing: true,
      aspect: [1, 1],
    });

    if (!result.canceled && result.assets.length > 0) {
      const asset = result.assets[0];
      setBandPictureUri(asset.uri ?? null);
    }
  };

  // Reset both forms when screen loses focus (navigated away) or unmounts
  // This ensures all entered data is cleared when returning to this screen
  useEffect(() => {
    if (!isFocused) {
      resetPostForm({ caption: "", image: "" });
      setPreviewUri(null);
      resetBandForm({ name: "", instrumentIds: [] });
      setBandPictureUri(null);
      setSelectedInstruments([]);
      setMode("post");
      setLoading(false);
    }

    return () => {
      // also clean up on unmount
      resetPostForm({ caption: "", image: "" });
      setPreviewUri(null);
      resetBandForm({ name: "", instrumentIds: [] });
      setBandPictureUri(null);
      setSelectedInstruments([]);
      setMode("post");
      setLoading(false);
    };
    // include reset functions in deps to satisfy linter rules
  }, [isFocused, resetPostForm, resetBandForm]);

  const onSubmitPost = async (data: PostFormData) => {
    setLoading(true);
    const formData = new FormData();

    // Use field names that match backend model (Caption, Image)
    formData.append("Caption", data.caption);
    if (data.image) {
      formData.append("Image", {
        uri: data.image,
        name: "photo.jpg",
        type: "image/jpeg",
      } as any);
    }

    try {
      await postsService.createPost(formData);
      // Invalidates both the feed ("posts") and any author-specific post lists
      // ("posts", "author", id), since react-query matches by key prefix.
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      router.back();
    }
    catch (err) {
      console.error("Error:", err);
    }
    finally {
      setLoading(false);
    }
  };

  const onSubmitBand = async (data: BandFormData) => {
    setLoading(true);
    try {
      const band = await bandsService.createBand({ name: data.name, instrumentIds: data.instrumentIds });

      if (bandPictureUri) {
        const pictureFormData = new FormData();
        pictureFormData.append("Picture", {
          uri: bandPictureUri,
          name: "band.jpg",
          type: "image/jpeg",
        } as any);

        try {
          await bandsService.updateBandPicture(band.id, pictureFormData);
        } catch (err) {
          console.error("Error uploading band picture:", err);
          Toast.show({
            type: "error",
            text1: "Band created",
            text2: "The picture could not be uploaded.",
          });
        }
      }

      router.back();
    } catch (err) {
      console.error("Error creating band:", err);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: err instanceof Error ? err.message : "Could not create band",
      });
    } finally {
      setLoading(false);
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

        <View style={styles.modeSwitcher}>
          <AnimatedPressable
            style={mode === "post" ? [styles.modeButton, styles.modeButtonActive] : styles.modeButton}
            onPress={() => setMode("post")}
          >
            <Text style={mode === "post" ? [styles.modeButtonText, styles.modeButtonTextActive] : styles.modeButtonText}>
              Post
            </Text>
          </AnimatedPressable>
          <AnimatedPressable
            style={mode === "band" ? [styles.modeButton, styles.modeButtonActive] : styles.modeButton}
            onPress={() => setMode("band")}
          >
            <Text style={mode === "band" ? [styles.modeButtonText, styles.modeButtonTextActive] : styles.modeButtonText}>
              Band
            </Text>
          </AnimatedPressable>
        </View>

        <AnimatedPressable
          style={styles.publishButton}
          onPress={mode === "post" ? handlePostSubmit(onSubmitPost) : handleBandSubmit(onSubmitBand)}
        >
          {loading ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <Text style={styles.publishText}>{mode === "post" ? "Publish" : "Create"}</Text>
          )}
        </AnimatedPressable>
      </View>

      {mode === "post" ? (
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <Controller
            control={postControl}
            name="caption"
            render={({ field: { onChange, value } }) => (
                <TextInput
                  style={styles.input}
                  placeholder="Write your caption..."
                  placeholderTextColor={COLORS.gray}
                  value={value}
                  onChangeText={onChange}
                  multiline
                  numberOfLines={4}
                />
            )}
          />
          {postErrors.caption && <Text style={styles.error}>{postErrors.caption.message}</Text>}

          <AnimatedPressable style={styles.imagePicker} onPress={pickImage}>
            {previewUri ? (
              <Image source={{ uri: previewUri }} style={styles.image} />
            ) : (
              <View style={styles.placeholderContent}>
                <MaterialIcons name="photo-camera" size={36} color={COLORS.gray} />
                <Text style={styles.placeholderText}>Select image</Text>
              </View>
            )}
          </AnimatedPressable>
          {postErrors.image && <Text style={styles.error}>{postErrors.image.message}</Text>}
        </ScrollView>
      ) : (
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <AnimatedPressable style={styles.bandPicturePicker} onPress={pickBandPicture}>
            {bandPictureUri ? (
              <Image source={{ uri: bandPictureUri }} style={styles.bandPictureImage} />
            ) : (
              <View style={styles.placeholderContent}>
                <MaterialIcons name="photo-camera" size={28} color={COLORS.gray} />
              </View>
            )}
          </AnimatedPressable>

          <Controller
            control={bandControl}
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
          {bandErrors.name && <Text style={styles.error}>{bandErrors.name.message}</Text>}

          <AnimatedPressable
            style={styles.selectInstrumentsButton}
            onPress={() => setInstrumentsModalVisible(true)}
          >
            <Text style={styles.selectInstrumentsText}>Select instruments</Text>
          </AnimatedPressable>
          <InstrumentBadges instruments={selectedInstruments} />
          {bandErrors.instrumentIds && <Text style={styles.error}>{bandErrors.instrumentIds.message}</Text>}
        </ScrollView>
      )}

      <SelectInstrumentsModal
        visible={instrumentsModalVisible}
        selectedIds={getBandValues("instrumentIds")}
        onClose={() => setInstrumentsModalVisible(false)}
        onConfirm={(ids, instruments) => {
          setBandValue("instrumentIds", ids, { shouldValidate: true });
          setSelectedInstruments(instruments);
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

  modeSwitcher: {
    flexDirection: "row",
    backgroundColor: COLORS.black,
    borderRadius: 20,
    padding: 3,
  },

  modeButton: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 17,
  },

  modeButtonActive: {
    backgroundColor: COLORS.lightBlueX2,
  },

  modeButtonText: {
    fontFamily: FONTS.jetBrainsMono,
    fontSize: 14,
    color: COLORS.gray,
  },

  modeButtonTextActive: {
    color: COLORS.white,
  },

  publishButton: {
    backgroundColor: COLORS.lightBlueX2,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },

  publishText: {
    color: COLORS.white,
    fontFamily: FONTS.spaceMono,
  },

  container: {
    padding: 20,
    backgroundColor: COLORS.darkBlue,
    gap: 12,
  },

  input: {
    backgroundColor: COLORS.white,
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.gray,
    fontFamily: FONTS.spaceMono,
    textAlignVertical: "top",
  },

  imagePicker: {
    marginTop: 8,
    borderRadius: 10,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: COLORS.gray,
    backgroundColor: COLORS.white,
    height: 320,
    alignItems: "center",
    justifyContent: "center",
  },

  image: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },

  placeholderContent: {
    alignItems: "center",
    justifyContent: "center",
  },

  placeholderText: {
    color: COLORS.gray,
    marginTop: 8,
    fontFamily: FONTS.spaceMono,
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
