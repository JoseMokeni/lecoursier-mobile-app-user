import React, { createContext, useContext, useRef, useCallback } from "react";
import { EarnedBadge } from "@/types/badge";

interface BadgeContextType {
  onNewBadgeEarned: (callback: (badge: any) => void) => () => void;
  emitBadgeEarned: (badgeData: any) => void;
}

const BadgeContext = createContext<BadgeContextType | undefined>(undefined);

export const BadgeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const listenersRef = useRef<((badge: any) => void)[]>([]);

  const onNewBadgeEarned = useCallback((callback: (badge: any) => void) => {
    console.log(
      "BadgeContext: Adding listener, current count:",
      listenersRef.current.length
    );
    listenersRef.current.push(callback);
    console.log(
      "BadgeContext: New listener count:",
      listenersRef.current.length
    );

    // Return cleanup function
    return () => {
      console.log("BadgeContext: Removing listener");
      listenersRef.current = listenersRef.current.filter(
        (listener) => listener !== callback
      );
      console.log(
        "BadgeContext: Remaining listeners:",
        listenersRef.current.length
      );
    };
  }, []);

  const emitBadgeEarned = useCallback((badgeData: any) => {
    console.log("BadgeContext: emitBadgeEarned called with:", badgeData);
    console.log(
      "BadgeContext: Current listeners count:",
      listenersRef.current.length
    );
    listenersRef.current.forEach((listener, index) => {
      console.log(`BadgeContext: Calling listener ${index + 1}`);
      listener(badgeData);
    });
  }, []);

  return (
    <BadgeContext.Provider value={{ onNewBadgeEarned, emitBadgeEarned }}>
      {children}
    </BadgeContext.Provider>
  );
};

export const useBadgeContext = () => {
  const context = useContext(BadgeContext);
  if (context === undefined) {
    throw new Error("useBadgeContext must be used within a BadgeProvider");
  }
  return context;
};
