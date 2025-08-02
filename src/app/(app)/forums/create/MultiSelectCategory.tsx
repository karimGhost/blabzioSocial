import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

export function MultiSelectCategory({ value = [], onChange }) {
  const categories = [
    "Science",
    "Technology",
    "Gaming",
    "Education",
    "Health",
    "Business",
    "Lifestyle",
    "Entertainment",
    "Politics",
    "Other",
  ];

  const categoryColors = {
    Science: "bg-blue-500 text-white",
    Technology: "bg-indigo-500 text-white",
    Gaming: "bg-purple-500 text-white",
    Education: "bg-green-500 text-white",
    Health: "bg-emerald-500 text-white",
    Business: "bg-yellow-500 text-black",
    Lifestyle: "bg-pink-500 text-white",
    Entertainment: "bg-red-500 text-white",
    Politics: "bg-orange-500 text-white",
    Other: "bg-gray-500 text-white",
  };

  const toggleCategory = (category: string) => {
    if (value.includes(category)) {
      onChange(value.filter((c: string) => c !== category));
    } else {
      onChange([...value, category]);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="w-full justify-between">
          {value.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {value.map((cat: string) => (
                <Badge
                  key={cat}
                  className={`${categoryColors[cat] || "bg-gray-500 text-white"} text-xs font-medium`}
                >
                  {cat}
                </Badge>
              ))}
            </div>
          ) : (
            "Select categories"
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuLabel>Select categories</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {categories.map((category) => (
          <DropdownMenuCheckboxItem
            key={category}
            checked={value.includes(category)}
            onCheckedChange={() => toggleCategory(category)}
          >
            {category}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
