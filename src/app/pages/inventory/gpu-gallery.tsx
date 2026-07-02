import { Link } from "react-router";
import { ArrowLeft, Images } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { usePersistentState } from "../../hooks/use-persistent-state";
import type { GpuItem } from "../../types/gpu-item";

export function GpuGallery() {
  const [gpus] = usePersistentState<GpuItem[]>("gamingtech.gpus", []);

  return (
    <div className="space-y-6 pb-20 lg:pb-6">
      <div className="flex items-center gap-4">
        <Link to="/inventory">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Customer Gallery</h1>
          <p className="text-muted-foreground mt-1">View customer GPU media records</p>
        </div>
      </div>

      {gpus.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center text-muted-foreground">
            <Images className="mx-auto mb-3 h-10 w-10" />
            No GPU media records yet. Add GPUs first.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {gpus.map((gpu) => (
            <Card key={gpu.id} className="overflow-hidden">
              <div className="flex aspect-video items-center justify-center bg-muted">
                <Images className="h-12 w-12 text-muted-foreground" />
              </div>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${gpu.customer}`} />
                    <AvatarFallback>{gpu.customer?.[0] ?? "G"}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="truncate font-medium">{gpu.customer}</p>
                    <p className="truncate text-sm text-muted-foreground">{gpu.model}</p>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Badge variant="outline">{gpu.id}</Badge>
                  <Badge variant="secondary">{gpu.status}</Badge>
                  <Badge variant="outline">{gpu.serial}</Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
