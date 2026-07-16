import { useRef } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useSocket } from "@/hooks/use-socket";
import { useTheme } from "./theme-provider";
import { isUserOnline } from "@/lib/helper";
import Logo from "./logo";
import { PROTECTED_ROUTES } from "@/routes/routes";
import { Button } from "./ui/button";
import { Moon, Sun } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import AvatarWithBadge from "./avatar-with-badge";
import { toast } from "sonner";
import { Spinner } from "./ui/spinner";
import { cn } from "@/lib/utils";

const AsideBar = () => {
  const { user, logout, isUpdatingAvatar, updateAvatar } = useAuth();
  const { theme, setTheme } = useTheme();
  const { onlineUsers } = useSocket();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isOnline = isUserOnline(user?._id, onlineUsers);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      updateAvatar(reader.result as string);
    };
    reader.readAsDataURL(file);
    
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <aside
      className="
  top-0 fixed inset-y-0
  w-11 left-0 z-50
  h-svh bg-primary/85 dark:bg-card dark:border-r border-border shadow-sm"
    >
      <div
        className="
       w-full h-full px-1 pt-1 pb-6 flex flex-col
       items-center justify-between"
      >
        <Logo
          url={PROTECTED_ROUTES.CHAT}
          imgClass="size-7"
          textClass="text-white"
          showText={false}
        />

        <div
          className="
         flex flex-col items-center gap-3
        "
        >
          <Button
            variant="outline"
            size="icon"
            className="border-0 rounded-full"
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
          >
            <Sun
              className="
              h-[1.2rem]
              w-[1.2rem]
              scale-100
              rotate-0
              transition-all dark:scale-0 dark:-rotate-90
            "
            />
            <Moon
              className="
             absolute
              h-[1.2rem]
              w-[1.2rem]
              scale-0
              rotate-90
              transition-all dark:scale-100
              dark:-rotate-0
              "
            />
          </Button>

          <input
            type="file"
            accept="image/*"
            className="hidden"
            ref={fileInputRef}
            onChange={handleFileChange}
          />
          <DropdownMenu>
            <DropdownMenuTrigger className="outline-none border-none bg-transparent p-0 m-0 cursor-pointer">
              <div className="relative">
                <AvatarWithBadge
                  name={user?.name || "unKnown"}
                  src={user?.avatar || ""}
                  isOnline={isOnline}
                  className={cn("bg-white!", isUpdatingAvatar && "opacity-50")}
                />
                {isUpdatingAvatar && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Spinner className="w-4 h-4 text-primary" />
                  </div>
                )}
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-48 rounded-lg z-50" align="end">
              <div className="px-1.5 py-1 text-xs font-medium text-muted-foreground">
                My Account
              </div>
              <DropdownMenuItem onClick={() => fileInputRef.current?.click()}>
                Change Profile Picture
              </DropdownMenuItem>
              {user?.avatar && (
                <DropdownMenuItem
                  onClick={() => updateAvatar(null)}
                  className="text-destructive focus:text-destructive"
                >
                  Remove Profile Picture
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={logout}>Logout</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </aside>
  );
};

export default AsideBar;
