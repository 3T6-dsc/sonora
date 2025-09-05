'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/firebase/firebase';
import { doSignOut, doChangePassword, doChangeEmail } from '@/firebase/auth';
import { motion } from 'framer-motion';
import { User, LogOut, Edit, Key, Mail, Calendar, ArrowLeft } from 'lucide-react';
import Image from 'next/image';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { updateProfile } from "firebase/auth";

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const [showEditNameDialog, setShowEditNameDialog] = useState(false);
  const [newDisplayName, setNewDisplayName] = useState('');
  const [showChangePasswordDialog, setShowChangePasswordDialog] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [showChangeEmailDialog, setShowChangeEmailDialog] = useState(false);
  const [error, setError] = useState('');
  const [showLogoutAlert, setShowLogoutAlert] = useState(false);

  const handleGoBack = () => {
    window.location.href = '/';
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        console.log('User data from onAuthStateChanged:', user);
        setUser({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          emailVerified: user.emailVerified,
          metadata: user.metadata
        });
        setNewDisplayName(user.displayName || '');
      } else {
        router.push('/login');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  const handleSignOut = async () => {
    setShowLogoutAlert(true);
  };

  const performLogout = async () => {
    try {
      await doSignOut();
      // Clear local storage
      localStorage.clear();
      // Reload the entire page after successful logout
      window.location.reload();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleEditName = async () => {
    try {
      await updateProfile(auth.currentUser, { displayName: newDisplayName });
      setUser({ ...user, displayName: newDisplayName });
      setShowEditNameDialog(false);
    } catch (error) {
      console.error('Error updating display name:', error);
    }
  };

  const handleChangePassword = async () => {
    setError('');
    try {
      await doChangePassword(currentPassword, newPassword);
      setShowChangePasswordDialog(false);
      setCurrentPassword('');
      setNewPassword('');
    } catch (error) {
      setError(error.message);
    }
  };

  const handleChangeEmail = async () => {
    setError('');
    try {
      await doChangeEmail(currentPassword, newEmail);
      setUser({ ...user, email: newEmail });
      setShowChangeEmailDialog(false);
      setCurrentPassword('');
      setNewEmail('');
    } catch (error) {
      setError(error.message);
    }
  };

  const getProfileImageSrc = () => {
    if (user?.photoURL?.startsWith('https://lh3.googleusercontent.com')) {
      return user.photoURL;
    }
    return '/avatar.png';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="text-white text-2xl">Loading...</div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gradient-dark text-white p-4 sm:p-8"
    >
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-4 sm:mb-8">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              onClick={handleGoBack}
              variant="ghost"
              className="flex items-center text-white hover:text-purple-300 hover:bg-white/10 transition-all duration-300"
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
              Back
            </Button>
          </motion.div>
          <motion.h1 
            className="text-2xl sm:text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent"
            initial={{ y: -20 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.5, type: "spring" }}
          >
            Your Profile
          </motion.h1>
        </div>
        {user && (
          <motion.div 
            className="glass-dark rounded-lg shadow-lg overflow-hidden border border-gray-700 glow-purple"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="relative h-32 sm:h-48 bg-gradient-to-r from-blue-500 to-purple-600 overflow-hidden">
              <motion.div
                className="absolute inset-0 bg-[url('/noise.png')] opacity-20"
                initial={{ backgroundPosition: '0% 0%' }}
                animate={{ backgroundPosition: '100% 100%' }}
                transition={{ duration: 20, repeat: Infinity, repeatType: 'reverse' }}
              />
              <motion.div 
                className="absolute -bottom-12 sm:-bottom-16 left-4 sm:left-8"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <div className="rounded-full p-1 bg-gradient-to-r from-blue-500 to-purple-600 glow-sm">
                  <Image
                    src={getProfileImageSrc()}
                    alt="Profile"
                    width={96}
                    height={96}
                    className="rounded-full border-2 border-gray-800 w-24 h-24 sm:w-32 sm:h-32"
                  />
                </div>
              </motion.div>
            </div>
            <div className="pt-16 sm:pt-20 px-4 sm:px-8 pb-4 sm:pb-8">
              <div className="flex flex-col sm:flex-row justify-between items-start mb-4 sm:mb-6">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.6 }}
                >
                  <h2 className="text-2xl sm:text-3xl font-semibold bg-gradient-primary bg-clip-text text-transparent">{user.displayName || 'No display name set'}</h2>
                  <p className="text-gray-400 text-sm sm:text-base">{user.email}</p>
                </motion.div>
                <motion.div 
                  className="flex flex-col sm:flex-row gap-2 mt-2 sm:mt-0"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.6 }}
                >
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      onClick={handleSignOut}
                      variant="destructive"
                      className="flex items-center bg-gradient-to-r from-red-500 to-red-700 hover:from-red-600 hover:to-red-800 transition-all duration-300"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign out
                    </Button>
                  </motion.div>
                </motion.div>
              </div>
              <motion.div 
                className="grid grid-cols-1 gap-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.8 }}
              >
                <ProfileInfoCard
                  icon={<User className="w-5 h-5" />}
                  title="Display Name"
                  value={user.displayName || 'Not set'}
                  action={
                    <Button
                      onClick={() => setShowEditNameDialog(true)}
                      variant="outline"
                      size="sm"
                      className="flex items-center text-black"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                  }
                />
                <ProfileInfoCard
                  icon={<Mail className="w-5 h-5" />}
                  title="Email"
                  value={user.email}
                  badge={
                    <span className={`text-xs px-2 py-1 rounded ${user.emailVerified ? 'bg-green-500' : 'bg-yellow-500'}`}>
                      {user.emailVerified ? 'Verified' : 'Not Verified'}
                    </span>
                  }
                />
                <ProfileInfoCard
                  icon={<Key className="w-5 h-5" />}
                  title="Password"
                  value="•••••••"
                  action={
                    <Button
                      onClick={() => setShowChangePasswordDialog(true)}
                      variant="outline"
                      size="sm"
                      className="flex items-center text-black"
                    >
                      <Key className="w-4 h-4 mr-2" />
                      Change
                    </Button>
                  }
                />
                <ProfileInfoCard
                  icon={<Calendar className="w-5 h-5" />}
                  title="Account Created"
                  value={user.metadata.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString() : 'N/A'}
                />
              </motion.div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Edit Name Dialog */}
      <AlertDialog open={showEditNameDialog} onOpenChange={setShowEditNameDialog}>
        <AlertDialogContent className="glass-dark text-white border border-gray-700 glow-sm">
          <AlertDialogHeader>
            <AlertDialogTitle>Edit Display Name</AlertDialogTitle>
            <AlertDialogDescription>
              Enter your new display name below.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Input
            type="text"
            placeholder="New display name"
            value={newDisplayName}
            onChange={(e) => setNewDisplayName(e.target.value)}
            className="bg-gray-700 text-white border-gray-600"
          />
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-gray-700 text-white hover:bg-gray-600">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleEditName} className="bg-blue-600 text-white hover:bg-blue-700">Save</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Change Password Dialog */}
      <AlertDialog open={showChangePasswordDialog} onOpenChange={setShowChangePasswordDialog}>
        <AlertDialogContent className="glass-dark text-white border border-gray-700 glow-sm">
          <AlertDialogHeader>
            <AlertDialogTitle>Change Password</AlertDialogTitle>
            <AlertDialogDescription>
              Enter your current password and new password below.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Input
            type="password"
            placeholder="Current password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="bg-gray-700 text-white border-gray-600 mb-2"
          />
          <Input
            type="password"
            placeholder="New password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="bg-gray-700 text-white border-gray-600"
          />
          {error && <p className="text-red-500 mt-2">{error}</p>}
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-gray-700 text-white hover:bg-gray-600">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleChangePassword} className="bg-blue-600 text-white hover:bg-blue-700">Change Password</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Change Email Dialog */}
      <AlertDialog open={showChangeEmailDialog} onOpenChange={setShowChangeEmailDialog}>
        <AlertDialogContent className="glass-dark text-white border border-gray-700 glow-sm">
          <AlertDialogHeader>
            <AlertDialogTitle>Change Email</AlertDialogTitle>
            <AlertDialogDescription>
              Enter your current password and new email below.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Input
            type="password"
            placeholder="Current password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="bg-gray-700 text-white border-gray-600 mb-2"
          />
          <Input
            type="email"
            placeholder="New email"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            className="bg-gray-700 text-white border-gray-600"
          />
          {error && <p className="text-red-500 mt-2">{error}</p>}
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-gray-700 text-white hover:bg-gray-600">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleChangeEmail} className="bg-blue-600 text-white hover:bg-blue-700">Change Email</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Logout Alert Dialog */}
      <AlertDialog open={showLogoutAlert} onOpenChange={setShowLogoutAlert}>
        <AlertDialogContent className="glass-dark text-white border border-gray-700 glow-sm">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to sign out?</AlertDialogTitle>
            <AlertDialogDescription>
              Your playlists and other data will remain saved in your account. You can log back in anytime to access them.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-gray-700 text-white hover:bg-gray-600">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={performLogout} className="bg-red-600 text-white hover:bg-red-700">Sign me out</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {error && (
        <div className="mt-4 p-4 bg-red-500 text-white rounded-lg">
          {error}
        </div>
      )}
    </motion.div>
  );
}

function ProfileInfoCard({ icon, title, value, action, badge }) {
  return (
    <motion.div 
      className="glass rounded-lg p-3 sm:p-4 border border-gray-700/50 hover:border-purple-500/50 transition-all duration-300"
      whileHover={{ y: -5, boxShadow: '0 10px 25px -5px rgba(124, 58, 237, 0.2)' }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center justify-between mb-1 sm:mb-2">
        <div className="flex items-center">
          <motion.div 
            className="text-purple-400"
            whileHover={{ rotate: 15, scale: 1.2 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            {icon}
          </motion.div>
          <span className="ml-2 text-gray-400 text-sm sm:text-base">{title}</span>
        </div>
        {badge}
      </div>
      <div className="flex items-center justify-between">
        <p className="text-base sm:text-lg">{value}</p>
        {action && (
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            {action}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}