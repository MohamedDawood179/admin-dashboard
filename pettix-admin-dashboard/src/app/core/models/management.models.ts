// ===================== Users =====================
export interface User {
    id: number;
    email: string;
    isVerified: boolean;
    googleId: string | null;
    contactId: number | null;
}

// ===================== Contacts =====================
export interface Contact {
    id: number;
    nameAr: string;
    nameEn: string;
    avatar: string | null;
    email: string | null;
    phone: string | null;
    genderId: number | null;
    contactTypeId: number | null;
    statusId: number | null;
    age: number | null;
    address?: string | null;
}

// ===================== Pets =====================
export interface Pet {
    id: number;
    code: string | null;
    name: string;
    description: string;
    details: string;
    age: number;
    lastAdoptedAt: string | null;
    adoptionStatus: number;
    categoryName: string | null;
    genderName: string | null;
    colorName: string | null;
    imageUrls: string[];
    location: string | null;
    isBlocked: boolean;
    reportsCount: number;
    contact: Contact | null;
    vaccinations?: any[];
    ownershipHistory?: any[];
}

// ===================== Adoptions =====================
export interface AdoptionForm {
    id: number;
    fullName: string;
    email: string;
    phoneNumber: string;
    dateOfBirth: string;
    petId: number;
    petName: string | null;
    livingSituation: string | null;
    typeOfResidence: string | null;
    hasOwnedOrCaredForPetBefore: boolean;
    petType: string | null;
    agreesToTerms: boolean;
    status: number; // 1=Pending, 2=Approved, 3=Rejected, 4=Cancelled
}

// ===================== Pet Reports =====================
export interface PetReport {
    id: number;
    petId: number;
    petName: string;
    authorName: string;
    reasonName: string;
    customReason: string | null;
    isRead: boolean;
    creationDate: string;
}
