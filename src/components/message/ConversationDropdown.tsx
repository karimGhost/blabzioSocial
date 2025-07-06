import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { MoreVertical } from "lucide-react";

function ConversationDropdown({ message, open, setOpen }: { message: any; open: string | null; setOpen: (id: string | null) => void }) {
  const isOpen = open === message;

  return (
    <DropdownMenu open={isOpen} onOpenChange={(v) => setOpen(v ? message : null)}>
      {/* Custom trigger */}
      <div
        onClick={() => setOpen(isOpen ? null : message)}
        className="cursor-pointer p-2 rounded hover:bg-gray-100 inline-flex items-center justify-center"
      >
        <MoreVertical className="h-5 w-5" />
      </div>

      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onSelect={() => {
            console.log("Delete clicked");
            setOpen(null);
          }}
        >
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default ConversationDropdown;
