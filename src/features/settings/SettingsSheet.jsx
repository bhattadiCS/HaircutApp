import { useState } from 'react';
import { ChevronRight, CloudOff, CloudUpload, Cpu, Images, Shield, Trash2, User } from 'lucide-react';
import { AnimatePresence, motion as Motion } from 'framer-motion';
import HapticButton from '../../components/HapticButton';
import { BUTTON_SPRING } from '../../Constants';

const runtimeTone = {
  ready: 'border-emerald-500/25 bg-emerald-500/10 text-emerald-200',
  warming: 'border-cyan-500/25 bg-cyan-500/10 text-cyan-100',
  degraded: 'border-amber-500/25 bg-amber-500/10 text-amber-100',
  unconfigured: 'border-white/10 bg-white/5 text-white/75',
  idle: 'border-white/10 bg-white/5 text-white/75',
};

export default function SettingsSheet({
  isOpen,
  user,
  aiRuntime,
  history,
  localOnlyMode,
  onClose,
  onToggleLocalOnlyMode,
  onOpenEditProfile,
  onDeleteAccount,
  onSignOut,
  onEditLook,
}) {
  const loadProgress = Math.round(aiRuntime.loadProgress ?? 0);
  const isWarming = aiRuntime.status === 'warming';
  const [selectedHistoryImage, setSelectedHistoryImage] = useState(null);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDeleteAccount() {
    if (!onDeleteAccount) {
      return;
    }

    setIsDeleting(true);
    const result = await onDeleteAccount();
    setIsDeleting(false);

    if (!result?.ok) {
      return;
    }

    setIsConfirmingDelete(false);
    setSelectedHistoryImage(null);
  }

  return (
    <AnimatePresence>
      {isOpen ? (
        <Motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-0 backdrop-blur-sm md:items-center md:p-4"
          onClick={onClose}
        >
          <Motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={BUTTON_SPRING}
            className="glass-panel relative flex max-h-[90vh] w-full flex-col overflow-hidden rounded-t-3xl shadow-2xl md:max-h-[85vh] md:max-w-sm md:rounded-3xl"
            style={{ paddingBottom: 'max(0.75rem, var(--safe-area-bottom))' }}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mx-auto mb-1 mt-3 h-1.5 w-12 rounded-full bg-zinc-700 md:hidden" />

            <div className="flex-1 overflow-y-auto">
              <div className="border-b border-white/5 p-6 text-center">
                <div className="mx-auto mb-4 h-20 w-20 overflow-hidden rounded-full border-4 border-fuchsia-500/15">
                  {user?.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt="Profile avatar"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-zinc-800">
                      <User className="h-8 w-8 text-zinc-500" />
                    </div>
                  )}
                </div>

                <h3 className="text-xl font-semibold text-white">
                  {user?.displayName || 'Guest User'}
                </h3>
                <p className="mt-1 text-sm text-white/45">Boutique AI Concierge</p>
              </div>

              <div className="space-y-3 p-4">
                <Motion.button
                  type="button"
                  onClick={onOpenEditProfile}
                  transition={BUTTON_SPRING}
                  whileHover={{ scale: 1.01, y: -1 }}
                  whileTap={{ scale: 0.99 }}
                  className="glass-panel flex w-full items-center gap-3 rounded-2xl p-4 text-left transition-colors hover:bg-white/[0.12]"
                >
                  <User className="h-5 w-5 text-fuchsia-300" />
                  <div className="flex-1">
                    <div className="font-medium text-white">Edit Profile</div>
                    <div className="text-xs text-white/45">Name, photo, and bio</div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-white/35" />
                </Motion.button>

                <div className="glass-panel rounded-2xl p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Cpu className="h-4 w-4 text-cyan-300" />
                    <span className="text-sm font-semibold text-white">Local Concierge</span>
                  </div>
                  <span
                    className={`rounded-full border px-2 py-1 text-[10px] uppercase tracking-[0.2em] ${runtimeTone[aiRuntime.status] || runtimeTone.idle}`}
                  >
                    {aiRuntime.status}
                  </span>
                </div>

                <p className="mt-3 text-xs text-white/55">{aiRuntime.modelLabel}</p>
                <p className="mt-2 text-xs text-white/40">
                  RAG: {aiRuntime.ragCollection} | Device target: {aiRuntime.device}
                </p>

                {isWarming ? (
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.22em] text-cyan-100/75">
                      <span>Loading on-device model</span>
                      <span>{loadProgress}%</span>
                    </div>
                    <div className="mt-2 h-2 rounded-full bg-white/8">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-cyan-300 to-fuchsia-300 transition-[width] duration-300"
                        style={{ width: `${Math.max(6, loadProgress)}%` }}
                      />
                    </div>
                  </div>
                ) : null}

                {aiRuntime.error ? (
                  <p className="mt-3 text-xs text-amber-100/80">
                    {aiRuntime.error}
                  </p>
                ) : null}
                </div>

                <div className="glass-panel rounded-2xl p-4">
                <div className="flex items-start gap-3">
                  <Shield className="mt-1 h-5 w-5 text-emerald-300" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <div className="font-medium text-white">Local Only Portraits</div>
                        <div className="text-xs text-white/45">
                          {localOnlyMode
                            ? 'Profile photos stay on this device.'
                            : 'Profile photos sync through Firebase Storage.'}
                        </div>
                      </div>

                      <button
                        type="button"
                        role="switch"
                        aria-checked={localOnlyMode}
                        aria-label="Toggle local only portrait mode"
                        onClick={onToggleLocalOnlyMode}
                        className={`relative inline-flex h-7 w-12 items-center rounded-full border transition-colors ${localOnlyMode ? 'border-emerald-300/40 bg-emerald-400/20' : 'border-white/10 bg-white/8'}`}
                      >
                        <span
                          className={`inline-block h-5 w-5 rounded-full bg-white shadow-md transition-transform ${localOnlyMode ? 'translate-x-6' : 'translate-x-1'}`}
                        />
                      </button>
                    </div>

                    <div className="mt-4 flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-white/55">
                      {localOnlyMode ? (
                        <CloudOff className="h-4 w-4 text-emerald-200" />
                      ) : (
                        <CloudUpload className="h-4 w-4 text-cyan-200" />
                      )}
                      <span>{localOnlyMode ? 'Cloud sync disabled' : 'Cloud sync enabled'}</span>
                    </div>

                    <p className="mt-3 text-xs leading-relaxed text-white/55">
                      {localOnlyMode
                        ? 'Portrait analysis and hairstyle simulations stay on-device, and profile photos are not uploaded. Recent looks stay in this browser until you sign out or clear site data.'
                        : 'Portrait analysis and hairstyle simulations still run locally. When cloud sync is enabled, your profile photo syncs through Firebase Storage and recent looks can sync to your account history.'}
                    </p>
                  </div>
                </div>
                </div>

                <div className="glass-panel rounded-2xl p-4">
                <div className="mb-3 flex items-center gap-2">
                  <Images className="h-4 w-4 text-cyan-300" />
                  <div>
                    <div className="text-sm font-semibold text-white">Recent Looks</div>
                    <div className="text-xs text-white/45">Tap a card to preview saved output.</div>
                  </div>
                </div>

                {history?.length ? (
                  <div className="flex gap-3 overflow-x-auto pb-2">
                    {history.slice(0, 6).map((image, index) => (
                      <button
                        key={`${image}-${index}`}
                        type="button"
                        onClick={() => setSelectedHistoryImage(image)}
                        className={`relative h-24 w-20 flex-shrink-0 overflow-hidden rounded-2xl border transition-colors ${selectedHistoryImage === image ? 'border-cyan-300/45' : 'border-white/10'}`}
                        aria-label={`Open recent look ${index + 1}`}
                      >
                        <img src={image} alt="Saved hairstyle preview" className="h-full w-full object-cover" />
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs leading-relaxed text-white/55">
                    {localOnlyMode
                      ? 'Generate a look to browse it here during this session. Local Only keeps the gallery on this browser.'
                      : 'Generate a look to build your recent gallery here.'}
                  </p>
                )}

                {selectedHistoryImage ? (
                  <div className="mt-4 flex flex-col overflow-hidden rounded-2xl border border-white/10">
                    <img src={selectedHistoryImage} alt="Selected saved look preview" className="h-56 w-full object-cover" />
                    <div className="bg-white/5 p-3">
                      <HapticButton
                        variant="secondary"
                        className="w-full text-cyan-50 border-cyan-500/20 hover:bg-cyan-500/10"
                        onClick={() => {
                          if (typeof onEditLook === 'function') {
                            onEditLook(selectedHistoryImage);
                          }
                        }}
                      >
                        Edit This Look
                      </HapticButton>
                    </div>
                  </div>
                ) : null}
                </div>

                <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-4">
                <div className="flex items-start gap-3">
                  <Trash2 className="mt-1 h-5 w-5 text-red-300" />
                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-white">Delete Account</div>
                    <p className="mt-2 text-xs leading-relaxed text-white/55">
                      Delete your sign-in, synced profile data, and saved looks from this app. This action cannot be undone.
                    </p>

                    {isConfirmingDelete ? (
                      <div className="mt-4 flex flex-wrap gap-3">
                        <HapticButton variant="secondary" onClick={() => setIsConfirmingDelete(false)}>
                          Cancel
                        </HapticButton>
                        <HapticButton
                          className="bg-red-300 text-slate-950 hover:bg-red-200"
                          onClick={handleDeleteAccount}
                          disabled={isDeleting}
                        >
                          {isDeleting ? 'Deleting...' : 'Delete My Account'}
                        </HapticButton>
                      </div>
                    ) : (
                      <HapticButton
                        variant="secondary"
                        className="mt-4 border-red-500/20 text-red-300 hover:bg-red-500/10"
                        onClick={() => setIsConfirmingDelete(true)}
                      >
                        Delete Account
                      </HapticButton>
                    )}
                  </div>
                </div>
                </div>
              </div>
            </div>

            <div className="border-t border-white/5 p-6">
              <HapticButton
                variant="secondary"
                className="w-full border-red-500/20 text-red-300 hover:bg-red-500/10"
                onClick={onSignOut}
              >
                Sign Out
              </HapticButton>
            </div>
          </Motion.div>
        </Motion.div>
      ) : null}
    </AnimatePresence>
  );
}