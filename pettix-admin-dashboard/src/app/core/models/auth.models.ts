export interface ContactDto {
    id: number;
    nameAr: string;
    nameEn: string;
    avatar?: string;
    email?: string;
    phone?: string;
    genderId?: number;
    contactTypeId?: number;
    statusId?: number;
    age?: number;
}

export interface LoginResponse {
    token: string;
    role: string;
    refreshToken: string;
    contact: ContactDto;
}

export interface User {
    id: number;
    email: string;
    name: string;
    role: string;
    avatar?: string;
}
