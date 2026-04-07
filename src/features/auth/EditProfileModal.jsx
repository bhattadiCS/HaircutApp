import React, { useState, useEffect, useRef } from 'react';
import { User, X, ChevronRight } from 'lucide-react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { auth, storage, updateProfile, ref, uploadBytes, getDownloadURL } from '../../firebase';
import { useAppStore } from '../../store/useAppStore';

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => resolve(event.target?.result);
    reader.onerror = () => reject(new Error('The selected file could not be read.'));
    reader.readAsDataURL(file);
  });
}

const EditProfileModal = ({ isOpen, onClose, user, onUpdateUser }) => {
  const [name, setName] = useState(user?.displayName || '');
  const [bio, setBio] = useState('Style enthusiast');
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);
  const localOnlyMode = useAppStore((state) => state.localOnlyMode);

  useEffect(() => {
    setName(user?.displayName || '');
  }, [user]);

  const handleSave = async () => {
    setLoading(true);
    try {
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, { displayName: name });
      }
      onUpdateUser({ ...user, displayName: name });
      onClose();
    } catch (error) {
      console.error("Error updating profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    try {
      const localPreviewUrl = await readFileAsDataUrl(file);
      let url = localPreviewUrl;

      if (auth.currentUser && !localOnlyMode) {
        const storageRef = ref(storage, `profile_photos/${user.uid}_${Date.now()}`);
        await uploadBytes(storageRef, file);
        url = await getDownloadURL(storageRef);
        await updateProfile(auth.currentUser, { photoURL: url });
      }

      onUpdateUser({ ...user, photoURL: url });
    } catch (error) {
      console.error("Upload failed, using local preview", error);
      const url = await readFileAsDataUrl(file);
      onUpdateUser({ ...user, photoURL: url });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <Motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] flex items-end justify-center bg-black/60 backdrop-blur-sm md:items-center"
          onClick={onClose}
        >
          <Motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="flex h-[85vh] w-full flex-col overflow-hidden rounded-t-xl bg-zinc-900 md:h-auto md:max-w-md md:rounded-xl"
            style={{ paddingBottom: 'max(0.75rem, var(--safe-area-bottom))' }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-profile-title"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-zinc-900">
              <button type="button" onClick={onClose} className="text-zinc-100 text-base">Cancel</button>
              <span id="edit-profile-title" className="font-bold text-zinc-50 text-base">Edit Profile</span>
              <button
                type="button"
                onClick={handleSave}
                disabled={loading}
                className="text-sky-300 font-bold text-base disabled:text-zinc-500"
              >
                {loading ? 'Saving...' : 'Done'}
              </button>
            </div>

            <div className="p-6 flex flex-col items-center gap-4 overflow-y-auto">
              <div className="flex flex-col items-center gap-3">
                <div className="w-24 h-24 rounded-full overflow-hidden border border-white/10">
                  {user?.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt="Profile avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-zinc-800 flex items-center justify-center">
                      <User className="w-10 h-10 text-zinc-500" />
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-sky-300 font-semibold text-sm"
                  aria-label="Change profile photo"
                >
                  Change profile photo
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                />
                <p className="max-w-xs text-center text-xs leading-relaxed text-zinc-400">
                  {localOnlyMode
                    ? 'Local Only is enabled. Profile photos stay on this device and are not uploaded.'
                    : 'Profile photos sync through Firebase Storage so your avatar follows you across devices.'}
                </p>
              </div>

              <div className="w-full space-y-6 mt-2">
                <div className="flex flex-col gap-1">
                  <label htmlFor="profile-name" className="text-zinc-300 text-xs">Name</label>
                  <input
                    id="profile-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="rounded-xl border border-white/10 bg-zinc-800/80 px-3 py-3 text-zinc-50 placeholder:text-zinc-300 focus:outline-none focus:border-white/30 transition-colors"
                    placeholder="Name"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label htmlFor="profile-username" className="text-zinc-300 text-xs">Username</label>
                  <input
                    id="profile-username"
                    type="text"
                    value={user?.email?.split('@')[0] || ''}
                    disabled
                    className="rounded-xl border border-white/10 bg-zinc-800/80 px-3 py-3 text-zinc-200 focus:outline-none"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label htmlFor="profile-bio" className="text-zinc-300 text-xs">Bio</label>
                  <textarea
                    id="profile-bio"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="h-20 resize-none rounded-xl border border-white/10 bg-zinc-800/80 px-3 py-3 text-zinc-50 placeholder:text-zinc-300 focus:outline-none focus:border-white/30 transition-colors"
                    placeholder="Write a bio..."
                  />
                </div>
              </div>
            </div>
          </Motion.div>
        </Motion.div>
      )}
    </AnimatePresence>
  );
};

export default EditProfileModal;
