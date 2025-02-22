import { Injectable, Req } from '@nestjs/common';
import { HttpException, HttpStatus } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { RegisterUserDto } from './dto/register-user.dto';
import * as firebaseAdmin from 'firebase-admin';
import { LoginDto } from './dto/login.dto';
import axios from 'axios';
import { Request } from 'express'; // Import Request type

@Injectable()
export class UserService {
  //register
  async registerUser(registerUser: RegisterUserDto) {
    console.log(registerUser);
    try {
      const userRecord = await firebaseAdmin.auth().createUser({
        displayName: registerUser.username,
        email: registerUser.email,
        password: registerUser.password,
      });
      console.log('User Record:', userRecord);
      return userRecord;
    } catch (error) {
      console.error('Error creating user:', error);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST); // Handle errors gracefully
    }
  }

  // Đăng nhập bằng Google
  async loginWithGoogle(googleIdToken: string) {
    console.log(`backend google token: ${googleIdToken}`);
    try {
      // Xác thực Google ID Token với Firebase
      const decodedToken = await firebaseAdmin
        .auth()
        .verifyIdToken(googleIdToken);

      // Kiểm tra xem người dùng đã tồn tại hay chưa
      let userRecord;
      try {
        userRecord = await firebaseAdmin.auth().getUser(decodedToken.uid);
      } catch (error) {
        // Nếu người dùng chưa tồn tại, tạo tài khoản mới
        userRecord = await firebaseAdmin.auth().createUser({
          uid: decodedToken.uid,
          displayName: decodedToken.name || 'Anonymous',
          email: decodedToken.email,
          photoURL: decodedToken.picture,
        });
      }

      // Không tạo custom token nữa, chỉ trả về ID token và thông tin người dùng
      return {
        message: 'Login successful',
        idToken: googleIdToken, // Sử dụng Google ID Token đã xác minh
        user: {
          email: userRecord.email,
          displayName: userRecord.displayName,
          photoURL: userRecord.photoURL,
        },
      };
    } catch (error) {
      console.error('Error during Google login:', error.message);
      throw new HttpException('Google login failed', HttpStatus.UNAUTHORIZED);
    }
  }

  //login with Email and Password
  async loginUser(payload: LoginDto) {
    const { email, password } = payload;
    try {
      const result = await this.signInWithEmailAndPassword(email, password);
      const { idToken = '', refreshToken = '', expiresIn = 0 } = result || {}; // Kiểm tra xem result có hợp lệ hay không

      if (!idToken) {
        throw new Error('Failed to retrieve authentication tokens');
      }

      return { idToken, refreshToken, expiresIn };
    } catch (error: any) {
      if (error.message.includes('EMAIL_NOT_FOUND')) {
        throw new Error('User not found.');
      } else if (error.message.includes('INVALID_PASSWORD')) {
        throw new Error('Invalid password.');
      } else {
        throw new Error(error.message || 'Unknown error');
      }
    }
  }

  private async signInWithEmailAndPassword(email: string, password: string) {
    const url = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${process.env.APIKEY}`;
    return await this.sendPostRequest(url, {
      email,
      password,
      returnSecureToken: true,
    });
  }
  private async sendPostRequest(url: string, data: any) {
    try {
      const response = await axios.post(url, data, {
        headers: { 'Content-Type': 'application/json' },
      });
      return response.data; // Trả về dữ liệu nếu thành công
    } catch (error) {
      console.error('Error during API request:', error); // Ghi log chi tiết lỗi
      throw new Error('Error during authentication request'); // Ném lỗi để phương thức gọi có thể xử lý
    }
  }

  async validateRequest(req): Promise<boolean> {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
      console.log('Authorization header not provided.');
      return false;
    }
    const [bearer, token] = authHeader.split(' ');
    if (bearer !== 'Bearer' || !token) {
      console.log('Invalid authorization format. Expected "Bearer <token>".');
      return false;
    }
    try {
      const decodedToken = await firebaseAdmin.auth().verifyIdToken(token);
      console.log('Decoded Token:', decodedToken);
      return true;
    } catch (error) {
      if (error.code === 'auth/id-token-expired') {
        console.error('Token has expired.');
      } else if (error.code === 'auth/invalid-id-token') {
        console.error('Invalid ID token provided.');
      } else {
        console.error('Error verifying token:', error);
      }
      return false;
    }
  }

  //refresh auth token
  async refreshAuthToken(refreshToken: string) {
    // console.log(`refresh token: `, refreshToken);
    try {
      const {
        id_token: idToken,
        refresh_token: newRefreshToken,
        expires_in: expiresIn,
      } = await this.sendRefreshAuthTokenRequest(refreshToken);
      return {
        idToken,
        refreshToken: newRefreshToken,
        expiresIn,
      };
    } catch (error: any) {
      if (error.message.includes('INVALID_REFRESH_TOKEN')) {
        throw new Error(`Invalid refresh token: ${refreshToken}.`);
      } else {
        throw new Error('Failed to refresh token');
      }
    }
  }
  private async sendRefreshAuthTokenRequest(refreshToken: string) {
    const url = `https://securetoken.googleapis.com/v1/token?key=${process.env.APIKEY}`;
    const payload = {
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    };
    return await this.sendPostRequest(url, payload);
  }

  //verify jwt token
  async verifyToken(token: string) {
    try {
      const decodedToken = await firebaseAdmin.auth().verifyIdToken(token);
      return decodedToken; // Trả về thông tin decoded của token
    } catch (error) {
      throw new Error('Invalid token');
    }
  }

  async getUID(req: Request) {
    const token = req.headers.authorization?.split(' ')[1]; // Lấy token từ header

    if (!token) {
      throw new Error('No token provided');
    }

    // Xác thực token và lấy thông tin người dùng
    try {
      const decodedToken = await this.verifyToken(token);

      // Trả về uid từ decoded token
      return decodedToken.uid;
    } catch (error) {
      throw new Error('Invalid token');
    }
  }

  //get profile
  async getProfile(req: Request) {
    // Lấy UID từ token người dùng
    const uid = await this.getUID(req);

    if (!uid) {
      throw new Error('No token provided');
    }

    // Xác thực token và lấy thông tin người dùng
    try {
      // Lấy thông tin người dùng từ Firebase
      const userRecord = await firebaseAdmin.auth().getUser(uid);
      if (!userRecord) {
        throw new Error('UID does not exist on firebase');
      }

      return {
        email: userRecord.email,
        username: userRecord.displayName,
        photoURL: userRecord.photoURL,
      };
    } catch (error) {
      throw new Error(`Error: ${error}`);
    }
  }

  async updateProfile(
    updateUserDto: UpdateUserDto,
    req: Request,
  ): Promise<any> {
    try {
      // Lấy UID từ token người dùng
      const uid = await this.getUID(req);

      // Tạo đối tượng cập nhật người dùng
      const updatePayload: firebaseAdmin.auth.UpdateRequest = {};

      // Chỉ cập nhật các trường có trong UpdateUserDto
      const { username, password, photoURL } = updateUserDto;

      if (username) {
        updatePayload.displayName = username; // Cập nhật tên người dùng
      }
      if (password) {
        updatePayload.password = password; // Cập nhật mật khẩu
      }
      if (photoURL) {
        updatePayload.photoURL = photoURL; // Cập nhật URL ảnh đại diện
      }

      // Cập nhật người dùng trong Firebase bằng UID
      await firebaseAdmin.auth().updateUser(uid, updatePayload);

      const newProfile = this.getProfile(req);

      return {
        message: 'User updated successfully',
        username: (await newProfile).username,
        photoURL: (await newProfile).photoURL,
      };
    } catch (error) {
      throw new Error(`Error updating user: ${error.message}`);
    }
  }

  // Phương thức để xóa người dùng trên Firebase
  async removeUser(req: Request): Promise<any> {
    try {
      // Lấy UID từ token người dùng
      const uid = await this.getUID(req);

      // Xóa người dùng khỏi Firebase
      await firebaseAdmin.auth().deleteUser(uid);

      return { message: 'User removed successfully' };
    } catch (error) {
      throw new Error(`Error removing user: ${error.message}`);
    }
  }
}
