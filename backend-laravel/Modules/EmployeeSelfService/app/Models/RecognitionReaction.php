<?php

namespace Modules\EmployeeSelfService\Models;

use App\Models\Employee;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Schema;

/**
 * RecognitionReaction
 *
 * After Phase 3e, reactions are stored as reactions_json on social_recognitions.
 * This model provides a backward-compatible interface: it can hydrate from
 * in-memory data (when $recognition and $employeeId are set) or fall back to
 * the live recognition_reactions table if it still exists.
 */
class RecognitionReaction extends Model
{
    protected $table = 'recognition_reactions';
    protected $primaryKey = 'reaction_id';

    protected $fillable = [
        'recognition_id',
        'employee_id',
        'reaction_type',
    ];

    // ---------- backward-compatible static helpers ----------

    /**
     * Fetch reactions for a given employee, grouped by recognition_id.
     * Returns [ recognition_id => ['clap','star', ...], ... ]
     *
     * Reads from recognition_reactions table if it exists, otherwise reads
     * reactions_json from social_recognitions.
     */
    public static function byEmployee(int $empId): array
    {
        if (Schema::hasTable('recognition_reactions')) {
            return static::where('employee_id', $empId)
                ->get()
                ->groupBy('recognition_id')
                ->map(fn ($g) => $g->pluck('reaction_type')->all())
                ->all();
        }

        // Read from reactions_json on social_recognitions
        $result = [];
        $posts = \Illuminate\Support\Facades\DB::table('social_recognitions')
            ->whereNotNull('reactions_json')
            ->get(['recognition_id', 'reactions_json']);

        foreach ($posts as $post) {
            $byEmployee = json_decode($post->reactions_json, true) ?? [];
            $empKey = (string) $empId;
            if (! empty($byEmployee[$empKey])) {
                $result[$post->recognition_id] = $byEmployee[$empKey];
            }
        }

        return $result;
    }

    /**
     * Toggle a reaction for an employee on a recognition.
     * Returns ['toggled' => 'added'|'removed', 'delta' => +1|-1].
     */
    public static function toggle(SocialRecognition $rec, int $empId, string $type): array
    {
        if (Schema::hasTable('recognition_reactions')) {
            $existing = static::where('recognition_id', $rec->recognition_id)
                ->where('employee_id', $empId)
                ->where('reaction_type', $type)
                ->first();

            if ($existing) {
                $existing->delete();
                return ['toggled' => 'removed', 'delta' => -1];
            }

            static::create([
                'recognition_id' => $rec->recognition_id,
                'employee_id'    => $empId,
                'reaction_type'  => $type,
            ]);
            return ['toggled' => 'added', 'delta' => +1];
        }

        // Work with reactions_json
        $json = json_decode($rec->reactions_json ?? '{}', true) ?: [];
        $empKey = (string) $empId;

        if (! isset($json[$empKey])) {
            $json[$empKey] = [];
        }

        $pos = array_search($type, $json[$empKey], true);
        if ($pos !== false) {
            array_splice($json[$empKey], $pos, 1);
            if (empty($json[$empKey])) {
                unset($json[$empKey]);
            }
            \Illuminate\Support\Facades\DB::table('social_recognitions')
                ->where('recognition_id', $rec->recognition_id)
                ->update(['reactions_json' => json_encode($json)]);
            return ['toggled' => 'removed', 'delta' => -1];
        }

        $json[$empKey][] = $type;
        \Illuminate\Support\Facades\DB::table('social_recognitions')
            ->where('recognition_id', $rec->recognition_id)
            ->update(['reactions_json' => json_encode($json)]);
        return ['toggled' => 'added', 'delta' => +1];
    }

    /**
     * Record a new initial reaction (used at kudos-post time).
     */
    public static function record(SocialRecognition $rec, int $empId, string $type): void
    {
        if (Schema::hasTable('recognition_reactions')) {
            static::create([
                'recognition_id' => $rec->recognition_id,
                'employee_id'    => $empId,
                'reaction_type'  => $type,
            ]);
            return;
        }

        $json = json_decode($rec->reactions_json ?? '{}', true) ?: [];
        $empKey = (string) $empId;
        if (! isset($json[$empKey])) {
            $json[$empKey] = [];
        }
        if (! in_array($type, $json[$empKey], true)) {
            $json[$empKey][] = $type;
        }
        \Illuminate\Support\Facades\DB::table('social_recognitions')
            ->where('recognition_id', $rec->recognition_id)
            ->update(['reactions_json' => json_encode($json)]);
    }

    // ---------- Eloquent relations (for legacy/rollback use) ----------

    public function recognition(): BelongsTo
    {
        return $this->belongsTo(SocialRecognition::class, 'recognition_id', 'recognition_id');
    }

    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class, 'employee_id', 'employee_id');
    }
}
