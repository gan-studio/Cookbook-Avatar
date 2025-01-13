import React from "react";

function Show({
  when,
  children,
  fallback = null,
}: React.PropsWithChildren<{
  when: boolean;
  fallback?: React.ReactNode;
}>) {
  return (
    <>
      {when && children}
      {!when && fallback}
    </>
  );
}

export default Show;
