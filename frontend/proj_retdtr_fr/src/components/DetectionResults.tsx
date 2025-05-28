"use client";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";

export interface DetectionResult {
  frame: number;
  label: string;
  confidence: number;
  bbox: [number, number, number, number]; // [x, y, w, h]
}

interface DetectionResultsProps {
  results: DetectionResult[];
}

const DetectionResults: React.FC<DetectionResultsProps> = ({ results }) => {
  return (
    <Card className="w-full mt-6">
      <CardHeader>
        <CardTitle>Detection Results</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Frame</TableHead>
              <TableHead>Label</TableHead>
              <TableHead>Confidence</TableHead>
              <TableHead>Bounding Box</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {results.map((res, idx) => (
              <TableRow key={idx}>
                <TableCell>{res.frame}</TableCell>
                <TableCell>{res.label}</TableCell>
                <TableCell>{(res.confidence * 100).toFixed(1)}%</TableCell>
                <TableCell>{`[${res.bbox.join(", ")}]`}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default DetectionResults; 