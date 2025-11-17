'use client';

import { useState } from 'react';
import Image from 'next/image';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { updateProfile } from 'firebase/auth';
import { storage, auth } from '@/lib/firebase';

export default function UserProfile() {
  const [avatar, setAvatar] = useState(null);
  const [preview, setPreview] = useState(null);
  const user = auth.currentUser;

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatar(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const uploadAvatar = async () => {
    if (!avatar || !user) return;

    const avatarRef = ref(storage, `avatars/${user.uid}`);
    await uploadBytes(avatarRef, avatar);

    const avatarURL = await getDownloadURL(avatarRef);

   await updateProfile(user, { photoURL: avatarURL });

await user.reload(); 

    alert('Avatar uploaded!');
  };

  return (
    <div className="max-w-md mx-auto mt-6">
      <h2 className="text-xl font-bold mb-4">User Profile</h2>
      <div className="mb-4">
        {preview ? (
          <Image
            src={preview}
            alt="Avatar Preview"
            width={96}
            height={96}
            className="w-24 h-24 rounded-full object-cover"
            unoptimized
          />
        ) : (
          <Image
            src={user?.photoURL || '/default-avatar.png'}
            alt="Avatar"
            width={96}
            height={96}
            className="rounded-full object-cover"
            unoptimized
          />
        )}
      </div>
      <input type="file" accept="image/*" onChange={handleAvatarChange} />
      <button
        onClick={uploadAvatar}
        className="mt-4 bg-blue-600 text-white px-4 py-2 rounded"
      >
        Upload Avatar
      </button>
    </div>
  );
}
