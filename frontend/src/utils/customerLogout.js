import { logoutCustomer } from '../features/auth/authSlice';
import { resetUserData } from './resetUserData';

/** Call from customer logout buttons — clears Redux + localStorage immediately. */
export const performCustomerLogout = async (dispatch, logoutMutation) => {
  try {
    if (logoutMutation) {
      await logoutMutation().unwrap();
    }
  } catch {
    // Still clear local state if API logout fails
  }
  dispatch(logoutCustomer());
  resetUserData(dispatch);
};
