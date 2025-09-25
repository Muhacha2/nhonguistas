import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ListFilter } from "lucide-react";

export function FeedFilters() {
  return (
    <div className="mb-6 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <h2 className="text-lg font-semibold">Sort by</h2>
        <Select defaultValue="latest">
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="latest">Latest</SelectItem>
            <SelectItem value="popular">Most Popular</SelectItem>
            <SelectItem value="following">Following</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button variant="outline" size="icon">
        <ListFilter className="h-4 w-4" />
        <span className="sr-only">Filter</span>
      </Button>
    </div>
  );
}
