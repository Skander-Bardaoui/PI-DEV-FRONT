import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ProfileSettings from './ProfileSettings';
import { useAuth } from '../../hooks/useAuth';
import {
  getMyProfile,
  updateProfile,
  uploadAvatar,
  changePassword,
} from '../../api/profile.api';
import { toast } from 'sonner';

// Mock dependencies
vi.mock('../../hooks/useAuth');
vi.mock('../../api/profile.api');
vi.mock('sonner');
vi.mock('browser-image-compression', () => ({
  default: vi.fn((file) => Promise.resolve(file)),
}));
vi.mock('../../components/profile/ImageCropModal', () => ({
  default: ({ isOpen, onCropComplete }: any) =>
    isOpen ? (
      <div data-testid="crop-modal">
        <button onClick={() => onCropComplete(new Blob())}>Crop</button>
      </div>
    ) : null,
}));
vi.mock('@/config/api.config', () => ({
  getAssetUrl: (url: string) => `https://api.test.com/${url}`,
}));

const mockUser = {
  id: 'user-1',
  email: 'test@test.com',
  firstName: 'John',
  lastName: 'Doe',
  role: 'BUSINESS_OWNER',
  avatarUrl: 'avatar.png',
};

const mockProfile = {
  firstName: 'John',
  lastName: 'Doe',
  phone: '+216 12 345 678',
  jobTitle: 'CEO',
  preferredLanguage: 'fr',
  timezone: 'Africa/Tunis',
};

const mockRefreshUser = vi.fn();

describe('ProfileSettings', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useAuth as any).mockReturnValue({
      user: mockUser,
      refreshUser: mockRefreshUser,
    });
    (getMyProfile as any).mockResolvedValue(mockProfile);
    (updateProfile as any).mockResolvedValue({});
    (uploadAvatar as any).mockResolvedValue({});
    (changePassword as any).mockResolvedValue({});
  });

  describe('Rendering', () => {
    it('should render profile settings page', async () => {
      render(<ProfileSettings />);
      
      await waitFor(() => {
        expect(screen.getByText('Mon Profil')).toBeInTheDocument();
        expect(screen.getByText('Gérez vos informations personnelles et vos préférences')).toBeInTheDocument();
      });
    });

    it('should show loading state initially', () => {
      render(<ProfileSettings />);
      
      expect(screen.getByRole('img', { hidden: true })).toBeInTheDocument();
    });

    it('should render all sections', async () => {
      render(<ProfileSettings />);
      
      await waitFor(() => {
        expect(screen.getByText('Informations personnelles')).toBeInTheDocument();
        expect(screen.getByText('Sécurité')).toBeInTheDocument();
      });
    });
  });

  describe('Profile Loading', () => {
    it('should load profile on mount', async () => {
      render(<ProfileSettings />);
      
      await waitFor(() => {
        expect(getMyProfile).toHaveBeenCalled();
      });
    });

    it('should populate form with profile data', async () => {
      render(<ProfileSettings />);
      
      await waitFor(() => {
        const firstNameInput = screen.getByLabelText(/Prénom/) as HTMLInputElement;
        expect(firstNameInput.value).toBe('John');
      });
    });

    it('should handle profile loading error', async () => {
      (getMyProfile as any).mockRejectedValue(new Error('Network error'));

      render(<ProfileSettings />);
      
      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Erreur lors du chargement du profil');
      });
    });
  });

  describe('Avatar Display', () => {
    it('should display user avatar when available', async () => {
      render(<ProfileSettings />);
      
      await waitFor(() => {
        const avatar = screen.getByAltText('Profile');
        expect(avatar).toBeInTheDocument();
        expect(avatar).toHaveAttribute('src', 'https://api.test.com/avatar.png');
      });
    });

    it('should display initial when no avatar', async () => {
      (useAuth as any).mockReturnValue({
        user: { ...mockUser, avatarUrl: null },
        refreshUser: mockRefreshUser,
      });

      render(<ProfileSettings />);
      
      await waitFor(() => {
        expect(screen.getByText('J')).toBeInTheDocument();
      });
    });

    it('should show upload hint text', async () => {
      render(<ProfileSettings />);
      
      await waitFor(() => {
        expect(screen.getByText('Cliquez sur la photo pour la modifier')).toBeInTheDocument();
        expect(screen.getByText('PNG, JPG, GIF jusqu\'à 5MB')).toBeInTheDocument();
      });
    });
  });

  describe('Avatar Upload', () => {
    it('should open file selector when clicking avatar', async () => {
      render(<ProfileSettings />);
      
      await waitFor(() => {
        expect(screen.getByAltText('Profile')).toBeInTheDocument();
      });

      const avatarButton = screen.getByAltText('Profile').closest('button');
      if (avatarButton) {
        fireEvent.click(avatarButton);
      }
    });

    it('should show crop modal after file selection', async () => {
      render(<ProfileSettings />);
      
      await waitFor(() => {
        expect(screen.getByAltText('Profile')).toBeInTheDocument();
      });

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      const file = new File(['test'], 'test.png', { type: 'image/png' });
      
      Object.defineProperty(fileInput, 'files', {
        value: [file],
        writable: false,
      });

      fireEvent.change(fileInput);

      await waitFor(() => {
        expect(screen.getByTestId('crop-modal')).toBeInTheDocument();
      });
    });

    it('should upload avatar after cropping', async () => {
      render(<ProfileSettings />);
      
      await waitFor(() => {
        expect(screen.getByAltText('Profile')).toBeInTheDocument();
      });

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      const file = new File(['test'], 'test.png', { type: 'image/png' });
      
      Object.defineProperty(fileInput, 'files', {
        value: [file],
        writable: false,
      });

      fireEvent.change(fileInput);

      await waitFor(() => {
        expect(screen.getByTestId('crop-modal')).toBeInTheDocument();
      });

      const cropButton = screen.getByText('Crop');
      fireEvent.click(cropButton);

      await waitFor(() => {
        expect(uploadAvatar).toHaveBeenCalled();
        expect(mockRefreshUser).toHaveBeenCalled();
        expect(toast.success).toHaveBeenCalledWith('Photo de profil mise à jour');
      });
    });

    it('should reject non-image files', async () => {
      render(<ProfileSettings />);
      
      await waitFor(() => {
        expect(screen.getByAltText('Profile')).toBeInTheDocument();
      });

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      const file = new File(['test'], 'test.txt', { type: 'text/plain' });
      
      Object.defineProperty(fileInput, 'files', {
        value: [file],
        writable: false,
      });

      fireEvent.change(fileInput);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Veuillez sélectionner une image');
      });
    });

    it('should reject files larger than 5MB', async () => {
      render(<ProfileSettings />);
      
      await waitFor(() => {
        expect(screen.getByAltText('Profile')).toBeInTheDocument();
      });

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      const largeFile = new File(['x'.repeat(6 * 1024 * 1024)], 'large.png', { type: 'image/png' });
      
      Object.defineProperty(fileInput, 'files', {
        value: [largeFile],
        writable: false,
      });

      fireEvent.change(fileInput);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith("L'image ne doit pas dépasser 5MB");
      });
    });

    it('should handle upload error', async () => {
      (uploadAvatar as any).mockRejectedValue({
        response: { data: { message: 'Upload failed' } },
      });

      render(<ProfileSettings />);
      
      await waitFor(() => {
        expect(screen.getByAltText('Profile')).toBeInTheDocument();
      });

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      const file = new File(['test'], 'test.png', { type: 'image/png' });
      
      Object.defineProperty(fileInput, 'files', {
        value: [file],
        writable: false,
      });

      fireEvent.change(fileInput);

      await waitFor(() => {
        expect(screen.getByTestId('crop-modal')).toBeInTheDocument();
      });

      const cropButton = screen.getByText('Crop');
      fireEvent.click(cropButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Upload failed');
      });
    });
  });

  describe('Profile Form', () => {
    it('should handle first name change', async () => {
      render(<ProfileSettings />);
      
      await waitFor(() => {
        expect(screen.getByLabelText(/Prénom/)).toBeInTheDocument();
      });

      const firstNameInput = screen.getByLabelText(/Prénom/);
      fireEvent.change(firstNameInput, { target: { value: 'Jane' } });

      expect((firstNameInput as HTMLInputElement).value).toBe('Jane');
    });

    it('should handle last name change', async () => {
      render(<ProfileSettings />);
      
      await waitFor(() => {
        expect(screen.getByLabelText(/Nom/)).toBeInTheDocument();
      });

      const lastNameInput = screen.getByLabelText(/Nom/);
      fireEvent.change(lastNameInput, { target: { value: 'Smith' } });

      expect((lastNameInput as HTMLInputElement).value).toBe('Smith');
    });

    it('should display email as read-only', async () => {
      render(<ProfileSettings />);
      
      await waitFor(() => {
        const emailInput = screen.getByDisplayValue('test@test.com') as HTMLInputElement;
        expect(emailInput).toBeDisabled();
        expect(screen.getByText("L'email ne peut pas être modifié")).toBeInTheDocument();
      });
    });

    it('should handle phone change', async () => {
      render(<ProfileSettings />);
      
      await waitFor(() => {
        expect(screen.getByLabelText(/Téléphone/)).toBeInTheDocument();
      });

      const phoneInput = screen.getByLabelText(/Téléphone/);
      fireEvent.change(phoneInput, { target: { value: '+216 99 999 999' } });

      expect((phoneInput as HTMLInputElement).value).toBe('+216 99 999 999');
    });

    it('should handle job title change', async () => {
      render(<ProfileSettings />);
      
      await waitFor(() => {
        expect(screen.getByLabelText(/Poste/)).toBeInTheDocument();
      });

      const jobTitleInput = screen.getByLabelText(/Poste/);
      fireEvent.change(jobTitleInput, { target: { value: 'CTO' } });

      expect((jobTitleInput as HTMLInputElement).value).toBe('CTO');
    });

    it('should display role badge', async () => {
      render(<ProfileSettings />);
      
      await waitFor(() => {
        expect(screen.getByText('BUSINESS_OWNER')).toBeInTheDocument();
      });
    });

    it('should handle language change', async () => {
      render(<ProfileSettings />);
      
      await waitFor(() => {
        expect(screen.getByLabelText(/Langue/)).toBeInTheDocument();
      });

      const languageSelect = screen.getByLabelText(/Langue/);
      fireEvent.change(languageSelect, { target: { value: 'en' } });

      expect((languageSelect as HTMLSelectElement).value).toBe('en');
    });

    it('should handle timezone change', async () => {
      render(<ProfileSettings />);
      
      await waitFor(() => {
        expect(screen.getByLabelText(/Fuseau horaire/)).toBeInTheDocument();
      });

      const timezoneSelect = screen.getByLabelText(/Fuseau horaire/);
      fireEvent.change(timezoneSelect, { target: { value: 'Europe/Paris' } });

      expect((timezoneSelect as HTMLSelectElement).value).toBe('Europe/Paris');
    });
  });

  describe('Save Profile', () => {
    it('should save profile successfully', async () => {
      render(<ProfileSettings />);
      
      await waitFor(() => {
        expect(screen.getByText('Enregistrer les modifications')).toBeInTheDocument();
      });

      const firstNameInput = screen.getByLabelText(/Prénom/);
      fireEvent.change(firstNameInput, { target: { value: 'Jane' } });

      const saveButton = screen.getByText('Enregistrer les modifications');
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(updateProfile).toHaveBeenCalledWith(
          expect.objectContaining({
            firstName: 'Jane',
          })
        );
        expect(mockRefreshUser).toHaveBeenCalled();
        expect(toast.success).toHaveBeenCalledWith('Profil mis à jour avec succès');
      });
    });

    it('should handle save error', async () => {
      (updateProfile as any).mockRejectedValue({
        response: { data: { message: 'Update failed' } },
      });

      render(<ProfileSettings />);
      
      await waitFor(() => {
        expect(screen.getByText('Enregistrer les modifications')).toBeInTheDocument();
      });

      const saveButton = screen.getByText('Enregistrer les modifications');
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Update failed');
      });
    });

    it('should show loading state while saving', async () => {
      (updateProfile as any).mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      );

      render(<ProfileSettings />);
      
      await waitFor(() => {
        expect(screen.getByText('Enregistrer les modifications')).toBeInTheDocument();
      });

      const saveButton = screen.getByText('Enregistrer les modifications');
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(screen.getByText('Enregistrement...')).toBeInTheDocument();
      });
    });
  });

  describe('Password Change', () => {
    it('should show change password button', async () => {
      render(<ProfileSettings />);
      
      await waitFor(() => {
        expect(screen.getByText('Changer le mot de passe')).toBeInTheDocument();
      });
    });

    it('should show password form when clicking change password', async () => {
      render(<ProfileSettings />);
      
      await waitFor(() => {
        expect(screen.getByText('Changer le mot de passe')).toBeInTheDocument();
      });

      const changePasswordButton = screen.getByText('Changer le mot de passe');
      fireEvent.click(changePasswordButton);

      await waitFor(() => {
        expect(screen.getByLabelText(/Mot de passe actuel/)).toBeInTheDocument();
        expect(screen.getByLabelText(/Nouveau mot de passe/)).toBeInTheDocument();
        expect(screen.getByLabelText(/Confirmer le nouveau mot de passe/)).toBeInTheDocument();
      });
    });

    it('should toggle password visibility', async () => {
      render(<ProfileSettings />);
      
      await waitFor(() => {
        expect(screen.getByText('Changer le mot de passe')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Changer le mot de passe'));

      await waitFor(() => {
        expect(screen.getByLabelText(/Mot de passe actuel/)).toBeInTheDocument();
      });

      const currentPasswordInput = screen.getByLabelText(/Mot de passe actuel/) as HTMLInputElement;
      expect(currentPasswordInput.type).toBe('password');

      const toggleButtons = screen.getAllByRole('button').filter(
        (btn) => btn.querySelector('svg')
      );
      fireEvent.click(toggleButtons[0]);

      expect(currentPasswordInput.type).toBe('text');
    });

    it('should change password successfully', async () => {
      render(<ProfileSettings />);
      
      await waitFor(() => {
        expect(screen.getByText('Changer le mot de passe')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Changer le mot de passe'));

      await waitFor(() => {
        expect(screen.getByLabelText(/Mot de passe actuel/)).toBeInTheDocument();
      });

      const currentPasswordInput = screen.getByLabelText(/Mot de passe actuel/);
      const newPasswordInput = screen.getByLabelText(/Nouveau mot de passe/);
      const confirmPasswordInput = screen.getByLabelText(/Confirmer le nouveau mot de passe/);

      fireEvent.change(currentPasswordInput, { target: { value: 'oldpassword' } });
      fireEvent.change(newPasswordInput, { target: { value: 'newpassword123' } });
      fireEvent.change(confirmPasswordInput, { target: { value: 'newpassword123' } });

      const submitButton = screen.getByText('Modifier le mot de passe');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(changePassword).toHaveBeenCalledWith({
          currentPassword: 'oldpassword',
          newPassword: 'newpassword123',
        });
        expect(toast.success).toHaveBeenCalledWith('Mot de passe modifié avec succès');
      });
    });

    it('should validate current password is required', async () => {
      render(<ProfileSettings />);
      
      await waitFor(() => {
        expect(screen.getByText('Changer le mot de passe')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Changer le mot de passe'));

      await waitFor(() => {
        expect(screen.getByLabelText(/Nouveau mot de passe/)).toBeInTheDocument();
      });

      const newPasswordInput = screen.getByLabelText(/Nouveau mot de passe/);
      const confirmPasswordInput = screen.getByLabelText(/Confirmer le nouveau mot de passe/);

      fireEvent.change(newPasswordInput, { target: { value: 'newpassword123' } });
      fireEvent.change(confirmPasswordInput, { target: { value: 'newpassword123' } });

      const submitButton = screen.getByText('Modifier le mot de passe');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Le mot de passe actuel est requis');
      });
    });

    it('should validate new password length', async () => {
      render(<ProfileSettings />);
      
      await waitFor(() => {
        expect(screen.getByText('Changer le mot de passe')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Changer le mot de passe'));

      await waitFor(() => {
        expect(screen.getByLabelText(/Mot de passe actuel/)).toBeInTheDocument();
      });

      const currentPasswordInput = screen.getByLabelText(/Mot de passe actuel/);
      const newPasswordInput = screen.getByLabelText(/Nouveau mot de passe/);
      const confirmPasswordInput = screen.getByLabelText(/Confirmer le nouveau mot de passe/);

      fireEvent.change(currentPasswordInput, { target: { value: 'oldpassword' } });
      fireEvent.change(newPasswordInput, { target: { value: 'short' } });
      fireEvent.change(confirmPasswordInput, { target: { value: 'short' } });

      const submitButton = screen.getByText('Modifier le mot de passe');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Le nouveau mot de passe doit contenir au moins 8 caractères');
      });
    });

    it('should validate passwords match', async () => {
      render(<ProfileSettings />);
      
      await waitFor(() => {
        expect(screen.getByText('Changer le mot de passe')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Changer le mot de passe'));

      await waitFor(() => {
        expect(screen.getByLabelText(/Mot de passe actuel/)).toBeInTheDocument();
      });

      const currentPasswordInput = screen.getByLabelText(/Mot de passe actuel/);
      const newPasswordInput = screen.getByLabelText(/Nouveau mot de passe/);
      const confirmPasswordInput = screen.getByLabelText(/Confirmer le nouveau mot de passe/);

      fireEvent.change(currentPasswordInput, { target: { value: 'oldpassword' } });
      fireEvent.change(newPasswordInput, { target: { value: 'newpassword123' } });
      fireEvent.change(confirmPasswordInput, { target: { value: 'differentpassword' } });

      const submitButton = screen.getByText('Modifier le mot de passe');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Les mots de passe ne correspondent pas');
      });
    });

    it('should handle password change error', async () => {
      (changePassword as any).mockRejectedValue({
        response: { data: { message: 'Wrong password' } },
      });

      render(<ProfileSettings />);
      
      await waitFor(() => {
        expect(screen.getByText('Changer le mot de passe')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Changer le mot de passe'));

      await waitFor(() => {
        expect(screen.getByLabelText(/Mot de passe actuel/)).toBeInTheDocument();
      });

      const currentPasswordInput = screen.getByLabelText(/Mot de passe actuel/);
      const newPasswordInput = screen.getByLabelText(/Nouveau mot de passe/);
      const confirmPasswordInput = screen.getByLabelText(/Confirmer le nouveau mot de passe/);

      fireEvent.change(currentPasswordInput, { target: { value: 'wrongpassword' } });
      fireEvent.change(newPasswordInput, { target: { value: 'newpassword123' } });
      fireEvent.change(confirmPasswordInput, { target: { value: 'newpassword123' } });

      const submitButton = screen.getByText('Modifier le mot de passe');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Wrong password');
      });
    });

    it('should cancel password change', async () => {
      render(<ProfileSettings />);
      
      await waitFor(() => {
        expect(screen.getByText('Changer le mot de passe')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Changer le mot de passe'));

      await waitFor(() => {
        expect(screen.getByLabelText(/Mot de passe actuel/)).toBeInTheDocument();
      });

      const cancelButton = screen.getByText('Annuler');
      fireEvent.click(cancelButton);

      await waitFor(() => {
        expect(screen.queryByLabelText(/Mot de passe actuel/)).not.toBeInTheDocument();
      });
    });
  });
});
