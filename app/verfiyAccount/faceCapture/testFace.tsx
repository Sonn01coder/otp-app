import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Camera, CameraType, CameraView } from 'expo-camera';
import * as FaceDetector from 'expo-face-detector';

export default function FaceCheckScreen() {
    const [hasYawLeft, setHasYawLeft] = useState(false);
    const [hasYawRight, setHasYawRight] = useState(false);
    const [hasBlinked, setHasBlinked] = useState(false);

    const [facing] = useState<CameraType>('front');
    const cameraRef = useRef<CameraView>(null);

    const onFacesDetected = ({ faces }) => {
        if (faces.length === 0) return;

        const face = faces[0];
        const { yawAngle, leftEyeOpenProbability, rightEyeOpenProbability } = face;

        // Quay trái (âm) và phải (dương)
        if (yawAngle < -15) setHasYawLeft(true);
        if (yawAngle > 15) setHasYawRight(true);

        // Nháy mắt
        if (
            leftEyeOpenProbability < 0.2 &&
            rightEyeOpenProbability < 0.2
        ) {
            setHasBlinked(true);
        }
    };

    const isHumanConfirmed = hasYawLeft && hasYawRight && hasBlinked;

    return (
        <View style={{ flex: 1 }}>
            <CameraView
                style={{ flex: 1 }}
                ref={cameraRef}
                facing={facing}
                onFacesDetected={onFacesDetected}
                faceDetectorSettings={{
                    mode: FaceDetector.FaceDetectorMode.accurate,
                    detectLandmarks: FaceDetector.FaceDetectorLandmarks.all,
                    runClassifications: FaceDetector.FaceDetectorClassifications.all,
                }}
            />
            <View style={styles.overlay}>
                <Text>Quay trái: {hasYawLeft ? '✅' : '❌'}</Text>
                <Text>Quay phải: {hasYawRight ? '✅' : '❌'}</Text>
                <Text>Nháy mắt: {hasBlinked ? '✅' : '❌'}</Text>
                <Text>Xác nhận người thật: {isHumanConfirmed ? '✅' : '❌'}</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    overlay: {
        position: 'absolute',
        top: 40,
        left: 20,
        backgroundColor: 'rgba(0,0,0,0.5)',
        padding: 10,
        borderRadius: 10,
    },
});
