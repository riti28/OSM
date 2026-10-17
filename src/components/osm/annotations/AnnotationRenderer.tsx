import { memo, useEffect, useRef } from "react";
import { Ellipse, Group, Line, Rect, Text, Transformer } from "react-konva";
import type Konva from "konva";
import type { Annotation } from "@/types/osm/annotation";
import { denormalizePoints, denormalizeRect, normalizeRect, clamp } from "@/lib/osm/coordinates";
import { transformAnnotation } from "@/lib/osm/annotations/annotationFactory";

type Props = { annotation: Annotation; width: number; height: number; selected: boolean; selectable: boolean;
  onSelect: (id: string | null) => void; onUpdate: (annotation: Annotation) => void; onComment: (annotation: Annotation) => void; };
function AnnotationRenderer(p: Props) {
  const group = useRef<Konva.Group>(null), transformer = useRef<Konva.Transformer>(null);
  const a = p.annotation, size = { width: p.width, height: p.height }, b = denormalizeRect(a.bounds, size);
  const w = Math.max(b.width, 1), h = Math.max(b.height, 1);
  const stroke = Math.max(a.style.strokeWidth * p.width, 0.5);
  useEffect(() => {
    if (p.selected && group.current && transformer.current) {
      transformer.current.nodes([group.current]);
      transformer.current.getLayer()?.batchDraw();
    }
  }, [p.selected, p.width, p.height, a]);
  const lineProps = { stroke: a.style.color, strokeWidth: stroke, lineCap: "round" as const, lineJoin: "round" as const, hitStrokeWidth: Math.max(12, stroke) };
  function commit() {
    const node = group.current;
    if (!node) return;
    const next = normalizeRect({ x: node.x(), y: node.y(), width: b.width * node.scaleX(), height: b.height * node.scaleY() }, size);
    node.scale({ x: 1, y: 1 });
    p.onUpdate(transformAnnotation(a, next));
  }
  return <>
    <Group ref={group} id={a.id} name="annotation" x={b.x} y={b.y} width={w} height={h}
      opacity={a.style.opacity} draggable={p.selectable}
      dragBoundFunc={position => ({ x: clamp(position.x, 0, p.width - w), y: clamp(position.y, 0, p.height - h) })}
      onClick={event => { event.cancelBubble = true; if (p.selectable) { p.onSelect(a.id); if (a.type === "comment") p.onComment(a); } }}
      onTap={event => { event.cancelBubble = true; if (p.selectable) { p.onSelect(a.id); if (a.type === "comment") p.onComment(a); } }}
      onDragStart={() => p.onSelect(a.id)} onDragEnd={commit} onTransformEnd={commit}>
      <Rect width={w} height={h} fill="transparent" />
      {a.type === "tick" && <Line {...lineProps} points={[w * 0.08, h * 0.5, w * 0.38, h * 0.88, w * 0.94, h * 0.08]} />}
      {a.type === "cross" && <><Line {...lineProps} points={[w * 0.1, h * 0.1, w * 0.9, h * 0.9]} />
        <Line {...lineProps} points={[w * 0.9, h * 0.1, w * 0.1, h * 0.9]} /></>}
      {a.type === "circle" && <Ellipse x={w / 2} y={h / 2} radiusX={Math.max(0.5, w / 2 - stroke / 2)}
        radiusY={Math.max(0.5, h / 2 - stroke / 2)} {...lineProps} />}
      {a.type === "highlight" && <Rect width={w} height={h} fill={a.style.color} />}
      {a.type === "pen" && <Line {...lineProps} tension={0.15}
        points={denormalizePoints(a.points, size).flatMap(point => [point.x - b.x, point.y - b.y])} />}
      {a.type === "comment" && <><Rect width={w} height={h} fill={a.style.color} cornerRadius={w * 0.18} />
        <Text text="≡" width={w} height={h} align="center" verticalAlign="middle" fill="white" fontSize={Math.min(w, h) * 0.8} /></>}
    </Group>
    {p.selected && p.selectable && <Transformer ref={transformer} rotateEnabled={false} flipEnabled={false}
      resizeEnabled={a.type !== "pen" && a.type !== "comment"} padding={4}
      borderStroke="#315ad9" anchorStroke="#315ad9" anchorFill="#ffffff" anchorSize={8}
      boundBoxFunc={(oldBox, nextBox) => nextBox.width < 8 || nextBox.height < 8 || nextBox.x < 0 || nextBox.y < 0 ||
        nextBox.x + nextBox.width > p.width || nextBox.y + nextBox.height > p.height ? oldBox : nextBox} />}
  </>;
}
export default memo(AnnotationRenderer);
