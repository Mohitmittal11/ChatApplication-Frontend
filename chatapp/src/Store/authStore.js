import { create } from "zustand";
import { persist } from "zustand/middleware";
const useAuthStore = create(
  persist(
    (set, get, state) => ({
      userId: "",
      name: "",
      setUserName: (details) => {
        set({ userId: details?.id, name: details?.name });
      },
    }),
    {
      name: "auth",
    }
  )
);

export default useAuthStore;
