import { useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { auth, signOut } from '../firebase';
import { useAppStore } from '../store/useAppStore';
import { useLocalLLM } from '../features/ai/hooks/useLocalLLM';
import EditProfileModal from '../features/auth/EditProfileModal';
import VibeCheck from '../features/quiz/VibeCheck';
import ShareStudio from '../features/share/ShareStudio';
import SettingsSheet from '../features/settings/SettingsSheet';
import MagicStudio from '../features/studio/MagicStudio';
import MirrorMode from '../features/studio/MirrorMode';
import RefineStudio from '../features/studio/RefineStudio';
import { useStudioGeneration } from '../features/studio/hooks/useStudioGeneration';
import { useCamera } from '../features/vision/hooks/useCamera';
import { getFaceFocusStyle } from '../features/vision/lib/faceFocus';

export default function AuthenticatedStudioShell({ persistVibeSelection }) {
  const user = useAppStore((state) => state.user);
  const view = useAppStore((state) => state.view);
  const originalImage = useAppStore((state) => state.originalImage);
  const generatedImage = useAppStore((state) => state.generatedImage);
  const selectedStyle = useAppStore((state) => state.selectedStyle);
  const analysisResult = useAppStore((state) => state.analysisResult);
  const processStep = useAppStore((state) => state.processStep);
  const show360 = useAppStore((state) => state.show360);
  const showSettings = useAppStore((state) => state.showSettings);
  const showEditProfile = useAppStore((state) => state.showEditProfile);
  const localOnlyMode = useAppStore((state) => state.localOnlyMode);
  const setUser = useAppStore((state) => state.setUser);
  const setView = useAppStore((state) => state.setView);
  const setOriginalImage = useAppStore((state) => state.setOriginalImage);
  const clearOriginalImage = useAppStore((state) => state.clearOriginalImage);
  const setToast = useAppStore((state) => state.setToast);
  const openSettings = useAppStore((state) => state.openSettings);
  const closeSettings = useAppStore((state) => state.closeSettings);
  const openEditProfile = useAppStore((state) => state.openEditProfile);
  const closeEditProfile = useAppStore((state) => state.closeEditProfile);
  const toggleLocalOnlyMode = useAppStore((state) => state.toggleLocalOnlyMode);
  const toggle360 = useAppStore((state) => state.toggle360);
  const signOutReset = useAppStore((state) => state.signOutReset);
  const aiRuntime = useLocalLLM();
  const camera = useCamera();
  const { handleGenerate, handleRefine } = useStudioGeneration({
    aiRuntime,
    getVisionSnapshot: camera.getVisionSnapshot,
  });
  const originalImageFocusStyle = getFaceFocusStyle(camera.visionState.focusBox);

  useEffect(() => {
    if (camera.error) {
      setToast({ message: camera.error, type: 'error' });
    }
  }, [camera.error, setToast]);

  useEffect(() => {
    if (
      view === 'mirror' &&
      originalImage &&
      aiRuntime.status === 'idle' &&
      aiRuntime.targetProfile.isConfigured
    ) {
      void aiRuntime.warmup();
    }
  }, [aiRuntime, originalImage, view]);

  function handleImageUpload(event) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = async (loadEvent) => {
      if (typeof loadEvent.target?.result !== 'string') {
        return;
      }

      const nextImage = loadEvent.target.result;

      setOriginalImage(nextImage);

      if (camera.isCameraOpen) {
        camera.stopCamera();
      }

      await camera.analyzeImage(nextImage);
    };

    event.target.value = '';
    reader.readAsDataURL(file);
  }

  function handleTakePhoto() {
    const capture = camera.capturePhoto();

    if (!capture?.image) {
      setToast({ message: 'Capture failed. Try again.', type: 'error' });
      return;
    }

    setOriginalImage(capture.image);
    camera.stopCamera({ preserveVisionState: true });
  }

  function handleMirrorBack() {
    if (camera.isCameraOpen) {
      camera.stopCamera();
    }

    camera.resetVisionState();
    setView('quiz');
  }

  function handleClearPortrait() {
    clearOriginalImage();
    camera.resetVisionState();
  }

  async function handleSignOut() {
    camera.stopCamera();

    try {
      if (auth.currentUser) {
        await signOut(auth);
      }
    } catch (error) {
      console.error('Sign out failed:', error);
    }

    signOutReset();
  }

  async function handleShareLook() {
    if (navigator.share) {
      await navigator.share({
        title: 'My StyleShift Preview',
        text: 'Previewed locally with StyleShift.',
        url: window.location.href,
      });
      return;
    }

    try {
      await navigator.clipboard.writeText(window.location.href);
      setToast({ message: 'Link copied to clipboard.', type: 'success' });
    } catch {
      setToast({ message: 'Sharing is unavailable here.', type: 'error' });
    }
  }

  let activeScene = null;

  if (view === 'quiz') {
    activeScene = (
      <VibeCheck
        key="quiz"
        user={user}
        onVibeSelect={persistVibeSelection}
        onOpenSettings={openSettings}
      />
    );
  }

  if (view === 'mirror') {
    activeScene = (
      <MirrorMode
        key="mirror"
        user={user}
        originalImage={originalImage}
        isCameraOpen={camera.isCameraOpen}
        videoRef={camera.videoRef}
        canvasRef={camera.canvasRef}
        analysisResult={analysisResult}
        show360={show360}
        visionState={camera.visionState}
        imageFocusStyle={originalImageFocusStyle}
        aiRuntime={aiRuntime}
        onBack={handleMirrorBack}
        onOpenSettings={openSettings}
        onStartCamera={camera.startCamera}
        onStopCamera={camera.stopCamera}
        onTakePhoto={handleTakePhoto}
        onImageUpload={handleImageUpload}
        onClearImage={handleClearPortrait}
        onToggle360={toggle360}
        onGenerate={handleGenerate}
      />
    );
  }

  if (view === 'magic') {
    activeScene = (
      <MagicStudio
        key="magic"
        originalImage={originalImage}
        imageFocusStyle={originalImageFocusStyle}
        processStep={processStep}
      />
    );
  }

  if (view === 'refine') {
    activeScene = (
      <RefineStudio
        key="refine"
        generatedImage={generatedImage}
        originalImage={originalImage}
        originalImageStyle={originalImageFocusStyle}
        analysisResult={analysisResult}
        onBack={() => setView('mirror')}
        onOpenShare={() => setView('share')}
        onRefine={handleRefine}
      />
    );
  }

  if (view === 'share') {
    activeScene = (
      <ShareStudio
        key="share"
        selectedStyle={selectedStyle}
        originalImage={originalImage}
        generatedImage={generatedImage}
        originalFaceFocus={camera.visionState.focusBox}
        originalImageStyle={originalImageFocusStyle}
        analysisResult={analysisResult}
        onBack={() => setView('refine')}
        onShare={handleShareLook}
      />
    );
  }

  return (
    <>
      <SettingsSheet
        isOpen={showSettings}
        user={user}
        aiRuntime={aiRuntime}
        localOnlyMode={localOnlyMode}
        onClose={closeSettings}
        onToggleLocalOnlyMode={toggleLocalOnlyMode}
        onOpenEditProfile={() => {
          openEditProfile();
          closeSettings();
        }}
        onSignOut={handleSignOut}
      />

      <EditProfileModal
        isOpen={showEditProfile}
        onClose={closeEditProfile}
        user={user}
        onUpdateUser={setUser}
      />

      <AnimatePresence initial={false} mode="wait">
        {activeScene}
      </AnimatePresence>
    </>
  );
}