// CNC G-Code Templates - Realistic operations for machine setup

export interface GCodeTemplate {
  id: string;
  name: string;
  description: string;
  gcode: string;
}

export const GCODE_TEMPLATES: GCodeTemplate[] = [
  {
    id: 'facing',
    name: 'Face Milling',
    description: 'Surface facing operation - 100x100mm workpiece',
    gcode: `; ===========================================
; FACE MILLING OPERATION
; Workpiece: 100 x 100 x 20 mm Aluminum
; Tool: 50mm Face Mill
; Depth of Cut: 1.0mm
; Stepover: 35mm (70%)
; ===========================================

G21        ; Metric units (mm)
G90        ; Absolute positioning
G17        ; XY plane selection
G54        ; Work coordinate system

; INITIALIZE
G0 Z25.0   ; Rapid to safe height
M3 S2000   ; Spindle ON, 2000 RPM
G4 P2      ; Dwell 2 seconds for spindle

; APPROACH
G0 X-30 Y15       ; Rapid to start position (outside workpiece)
G0 Z2.0           ; Rapid to clearance height
G1 Z-1.0 F150     ; Plunge to depth at slow feed

; PASS 1 - First row
G1 X130 Y15 F800  ; Cut across workpiece
G0 Z2.0           ; Rapid up
G0 X130 Y50       ; Rapid to next row start
G1 Z-1.0 F150     ; Plunge

; PASS 2 - Second row
G1 X-30 Y50 F800  ; Cut back
G0 Z2.0           ; Rapid up
G0 X-30 Y85       ; Rapid to next row start
G1 Z-1.0 F150     ; Plunge

; PASS 3 - Third row
G1 X130 Y85 F800  ; Cut across workpiece
G0 Z2.0           ; Rapid up

; RETRACT
G0 Z25.0          ; Rapid to safe height
G0 X0 Y0          ; Return to origin
M5                ; Spindle OFF
M30               ; Program end
`
  },
  {
    id: 'pocket',
    name: 'Pocket Milling',
    description: 'Rectangular pocket - 60x40mm, 8mm deep',
    gcode: `; ===========================================
; POCKET MILLING OPERATION
; Pocket: 60 x 40 x 8 mm
; Tool: 10mm End Mill
; Depth per Pass: 2.0mm
; Stepover: 6mm (60%)
; ===========================================

G21        ; Metric units (mm)
G90        ; Absolute positioning
G17        ; XY plane selection
G54        ; Work coordinate system

; INITIALIZE
G0 Z20.0   ; Rapid to safe height
M3 S3000   ; Spindle ON, 3000 RPM
G4 P1      ; Dwell for spindle

; POCKET START POSITION
G0 X20 Y20        ; Rapid to pocket corner
G0 Z2.0           ; Clearance height

; === LAYER 1: Z-2.0 ===
G1 Z-2.0 F100     ; Plunge

; Spiral outward
G1 X20 Y50 F600   ; Cut to corner
G1 X70 Y50        ; Cut along edge
G1 X70 Y20        ; Cut along edge
G1 X26 Y20        ; Cut along edge (leaving stepover)
G1 X26 Y44        ; Inner pass
G1 X64 Y44
G1 X64 Y26
G1 X32 Y26
G1 X32 Y38        ; Innermost pass
G1 X58 Y38
G1 X58 Y32
G1 X38 Y32

G0 Z2.0           ; Rapid up

; === LAYER 2: Z-4.0 ===
G0 X20 Y20        ; Return to start
G1 Z-4.0 F100     ; Plunge

G1 X20 Y50 F600
G1 X70 Y50
G1 X70 Y20
G1 X26 Y20
G1 X26 Y44
G1 X64 Y44
G1 X64 Y26
G1 X32 Y26
G1 X32 Y38
G1 X58 Y38
G1 X58 Y32
G1 X38 Y32

G0 Z2.0

; === LAYER 3: Z-6.0 ===
G0 X20 Y20
G1 Z-6.0 F100

G1 X20 Y50 F600
G1 X70 Y50
G1 X70 Y20
G1 X26 Y20
G1 X26 Y44
G1 X64 Y44
G1 X64 Y26
G1 X32 Y26
G1 X32 Y38
G1 X58 Y38
G1 X58 Y32
G1 X38 Y32

G0 Z2.0

; === LAYER 4: Z-8.0 (FINAL) ===
G0 X20 Y20
G1 Z-8.0 F100

G1 X20 Y50 F600
G1 X70 Y50
G1 X70 Y20
G1 X26 Y20
G1 X26 Y44
G1 X64 Y44
G1 X64 Y26
G1 X32 Y26
G1 X32 Y38
G1 X58 Y38
G1 X58 Y32
G1 X38 Y32

; FINISH PASS - Climb mill perimeter
G0 Z-8.0
G1 X20 Y20 F300
G1 X20 Y50
G1 X70 Y50
G1 X70 Y20
G1 X20 Y20

; RETRACT
G0 Z20.0
G0 X0 Y0
M5
M30
`
  },
  {
    id: 'drilling',
    name: 'Drilling Pattern',
    description: '4x4 hole pattern - 6mm holes, 15mm deep',
    gcode: `; ===========================================
; DRILLING OPERATION - PECK DRILL CYCLE
; Pattern: 4 x 4 holes (16 total)
; Hole Spacing: 20mm
; Hole Diameter: 6mm
; Hole Depth: 15mm
; Peck Depth: 3mm
; ===========================================

G21        ; Metric units (mm)
G90        ; Absolute positioning
G17        ; XY plane selection
G54        ; Work coordinate system

; INITIALIZE
G0 Z25.0   ; Rapid to safe height
M3 S1500   ; Spindle ON, 1500 RPM
G4 P1      ; Dwell for spindle

; DRILLING PARAMETERS
; Using G83 peck drilling simulation
; Peck: 3mm, Retract: 1mm above surface

; === ROW 1 ===
G0 X15 Y15        ; Hole 1
G0 Z2.0
G1 Z-3.0 F100     ; Peck 1
G0 Z1.0           ; Retract
G1 Z-6.0 F100     ; Peck 2
G0 Z1.0
G1 Z-9.0 F100     ; Peck 3
G0 Z1.0
G1 Z-12.0 F100    ; Peck 4
G0 Z1.0
G1 Z-15.0 F100    ; Final depth
G0 Z2.0           ; Clear

G0 X35 Y15        ; Hole 2
G1 Z-3.0 F100
G0 Z1.0
G1 Z-6.0 F100
G0 Z1.0
G1 Z-9.0 F100
G0 Z1.0
G1 Z-12.0 F100
G0 Z1.0
G1 Z-15.0 F100
G0 Z2.0

G0 X55 Y15        ; Hole 3
G1 Z-3.0 F100
G0 Z1.0
G1 Z-6.0 F100
G0 Z1.0
G1 Z-9.0 F100
G0 Z1.0
G1 Z-12.0 F100
G0 Z1.0
G1 Z-15.0 F100
G0 Z2.0

G0 X75 Y15        ; Hole 4
G1 Z-3.0 F100
G0 Z1.0
G1 Z-6.0 F100
G0 Z1.0
G1 Z-9.0 F100
G0 Z1.0
G1 Z-12.0 F100
G0 Z1.0
G1 Z-15.0 F100
G0 Z2.0

; === ROW 2 ===
G0 X15 Y35
G1 Z-15.0 F80     ; Straight drill (simplified)
G0 Z2.0

G0 X35 Y35
G1 Z-15.0 F80
G0 Z2.0

G0 X55 Y35
G1 Z-15.0 F80
G0 Z2.0

G0 X75 Y35
G1 Z-15.0 F80
G0 Z2.0

; === ROW 3 ===
G0 X15 Y55
G1 Z-15.0 F80
G0 Z2.0

G0 X35 Y55
G1 Z-15.0 F80
G0 Z2.0

G0 X55 Y55
G1 Z-15.0 F80
G0 Z2.0

G0 X75 Y55
G1 Z-15.0 F80
G0 Z2.0

; === ROW 4 ===
G0 X15 Y75
G1 Z-15.0 F80
G0 Z2.0

G0 X35 Y75
G1 Z-15.0 F80
G0 Z2.0

G0 X55 Y75
G1 Z-15.0 F80
G0 Z2.0

G0 X75 Y75
G1 Z-15.0 F80
G0 Z2.0

; RETRACT
G0 Z25.0
G0 X0 Y0
M5
M30
`
  },
  {
    id: 'contour',
    name: 'Contour Cut',
    description: 'Profile cut with arcs - complex shape',
    gcode: `; ===========================================
; CONTOUR CUTTING OPERATION
; Profile: Complex shape with arcs
; Material: 80 x 80 x 10 mm
; Tool: 6mm End Mill
; Depth: 10mm (full through)
; ===========================================

G21        ; Metric units (mm)
G90        ; Absolute positioning
G17        ; XY plane selection
G54        ; Work coordinate system

; INITIALIZE
G0 Z20.0   ; Rapid to safe height
M3 S4000   ; Spindle ON, 4000 RPM
G4 P1      ; Dwell for spindle

; APPROACH
G0 X0 Y40          ; Start at left edge, mid height
G0 Z2.0            ; Clearance

; === LAYER 1: Z-2.5 ===
G1 Z-2.5 F100      ; Plunge

; Contour path
G1 X10 Y40 F400    ; Lead-in
G1 X10 Y10         ; Down left side
G2 X20 Y0 I10 J0   ; Arc to bottom
G1 X60 Y0          ; Bottom edge
G2 X70 Y10 I0 J10  ; Arc to right
G1 X70 Y30         ; Up right side
G3 X60 Y40 I-10 J0 ; Concave arc
G1 X50 Y40         ; Across top
G3 X40 Y50 I0 J10  ; Concave arc up
G1 X40 Y60         ; Up
G2 X30 Y70 I-10 J0 ; Arc
G1 X20 Y70         ; Across
G2 X10 Y60 I0 J-10 ; Arc down
G1 X10 Y40         ; Complete

G0 Z2.0

; === LAYER 2: Z-5.0 ===
G0 X10 Y40
G1 Z-5.0 F100

G1 X10 Y10 F400
G2 X20 Y0 I10 J0
G1 X60 Y0
G2 X70 Y10 I0 J10
G1 X70 Y30
G3 X60 Y40 I-10 J0
G1 X50 Y40
G3 X40 Y50 I0 J10
G1 X40 Y60
G2 X30 Y70 I-10 J0
G1 X20 Y70
G2 X10 Y60 I0 J-10
G1 X10 Y40

G0 Z2.0

; === LAYER 3: Z-7.5 ===
G0 X10 Y40
G1 Z-7.5 F100

G1 X10 Y10 F400
G2 X20 Y0 I10 J0
G1 X60 Y0
G2 X70 Y10 I0 J10
G1 X70 Y30
G3 X60 Y40 I-10 J0
G1 X50 Y40
G3 X40 Y50 I0 J10
G1 X40 Y60
G2 X30 Y70 I-10 J0
G1 X20 Y70
G2 X10 Y60 I0 J-10
G1 X10 Y40

G0 Z2.0

; === LAYER 4: Z-10.0 (THROUGH CUT) ===
G0 X10 Y40
G1 Z-10.0 F100

; Final finish pass - slower feed
G1 X10 Y10 F250
G2 X20 Y0 I10 J0
G1 X60 Y0
G2 X70 Y10 I0 J10
G1 X70 Y30
G3 X60 Y40 I-10 J0
G1 X50 Y40
G3 X40 Y50 I0 J10
G1 X40 Y60
G2 X30 Y70 I-10 J0
G1 X20 Y70
G2 X10 Y60 I0 J-10
G1 X10 Y40

; Lead-out
G1 X0 Y40

; RETRACT
G0 Z20.0
G0 X0 Y0
M5
M30
`
  },
  {
    id: 'sample',
    name: 'Sample Program',
    description: 'Quick demo - square pocket with circle',
    gcode: `; Sample CNC Program - Square Pocket
; Units: mm
G21 ; Set to millimeters
G90 ; Absolute positioning
G17 ; XY plane selection

; Initialize
G0 Z5.0 ; Rapid to safe height
G0 X0 Y0 ; Rapid to origin

; Start cutting
M3 S12000 ; Spindle on
G0 X10 Y10 ; Move to start position
G1 Z-2.0 F100 ; Plunge

; Cut square pocket - Layer 1
G1 X50 Y10 F500
G1 X50 Y50
G1 X10 Y50
G1 X10 Y10

; Inner pass
G1 X20 Y20
G1 X40 Y20
G1 X40 Y40
G1 X20 Y40
G1 X20 Y20

; Circular pocket
G0 Z2.0
G0 X70 Y30
G1 Z-2.0 F100
G2 X70 Y30 I10 J0 F400

; Retract
G0 Z5.0
G0 X0 Y0

M5 ; Spindle off
M30 ; Program end
`
  }
];
