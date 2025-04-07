import './globals.css';

export default function RootLayout({ children }) {
  return (
    <html lang="pt-br">
      <body className="bg-[#f4fefb] text-gray-900">{children}</body>
    </html>
  );
}
