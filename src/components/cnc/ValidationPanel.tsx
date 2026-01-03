import { AlertTriangle, AlertCircle, CheckCircle } from 'lucide-react';
import { useGCodeStore } from '@/store/gcode-store';
import { validateGCode, ValidationIssue } from '@/lib/gcode-validator';
import { useMemo } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';

const ValidationPanel = () => {
  const { gcodeText } = useGCodeStore();

  const validation = useMemo(() => validateGCode(gcodeText), [gcodeText]);

  if (validation.issues.length === 0) {
    return (
      <div className="border-t border-border">
        <div className="panel-header text-xs flex items-center gap-2">
          <CheckCircle className="w-3 h-3 text-green-500" />
          Validation
        </div>
        <div className="p-3 text-xs text-muted-foreground flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-green-500" />
          No issues found
        </div>
      </div>
    );
  }

  return (
    <div className="border-t border-border">
      <div className="panel-header text-xs flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-3 h-3 text-yellow-500" />
          Validation
        </div>
        <div className="flex items-center gap-2 text-[10px]">
          {validation.errorCount > 0 && (
            <span className="text-destructive">{validation.errorCount} errors</span>
          )}
          {validation.warningCount > 0 && (
            <span className="text-yellow-500">{validation.warningCount} warnings</span>
          )}
        </div>
      </div>
      <ScrollArea className="h-24">
        <div className="p-2 space-y-1">
          {validation.issues.slice(0, 10).map((issue, index) => (
            <IssueItem key={index} issue={issue} />
          ))}
          {validation.issues.length > 10 && (
            <div className="text-xs text-muted-foreground px-2 py-1">
              +{validation.issues.length - 10} more issues
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

const IssueItem = ({ issue }: { issue: ValidationIssue }) => {
  const Icon = issue.type === 'error' ? AlertCircle : AlertTriangle;
  const colorClass = issue.type === 'error' ? 'text-destructive' : 'text-yellow-500';

  return (
    <div className="flex items-start gap-2 text-xs px-2 py-1 rounded hover:bg-muted/50">
      <Icon className={`w-3 h-3 mt-0.5 flex-shrink-0 ${colorClass}`} />
      <div className="flex-1 min-w-0">
        <span className="text-muted-foreground">Line {issue.line}: </span>
        <span className="text-foreground">{issue.message}</span>
      </div>
    </div>
  );
};

export default ValidationPanel;
