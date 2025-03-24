import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '管理控制台 - Extism插件生态系统',
  description: '管理Extism插件生态系统的用户、插件和系统设置',
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <div className="bg-primary text-primary-foreground py-2 px-4">
        <div className="container mx-auto flex justify-between items-center">
          <h2 className="text-lg font-semibold">Extism 管理控制台</h2>
          <div className="flex gap-4">
            <span>管理员账户</span>
            <span>注销</span>
          </div>
        </div>
      </div>
      <div className="flex-1">
        {children}
      </div>
    </div>
  );
} 