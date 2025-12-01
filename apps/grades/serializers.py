from decimal import Decimal, ROUND_HALF_UP

from rest_framework import serializers

from apps.accounts.models import Student, Teacher
from apps.classes.models import Matiere
from .models import Evaluation  # ou Grade si tu n'as pas renommé

class EvaluationSerializer(serializers.ModelSerializer):
    # champs en lecture calculés
    normalized_note = serializers.SerializerMethodField(read_only=True)
    note_ponderee = serializers.SerializerMethodField(read_only=True)

    # nested info pour affichage (lecture)
    student_info = serializers.SerializerMethodField(read_only=True)
    teacher_info = serializers.SerializerMethodField(read_only=True)
    matiere_info = serializers.SerializerMethodField(read_only=True)
    eval_type_display = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Evaluation
        # on expose les champs d'ecriture (ids) + champs calculés
        fields = [
            'id',
            'student', 'student_info',
            'matiere', 'matiere_info',
            'teacher', 'teacher_info',
            'eval_type', 'eval_type_display',
            'score', 'max_score',
            'normalized_note', 'note_ponderee',
            'date', 'trimester', 'cycle',
            'comment', 'created_at',
        ]
        read_only_fields = ['id', 'student_info', 'teacher_info', 'matiere_info',
                            'normalized_note', 'note_ponderee', 'created_at']

    # ---------- validations ----------
    def validate_max_score(self, value):
        if value is None or value <= 0:
            raise serializers.ValidationError("max_score doit être supérieur à 0.")
        return value

    def validate_score(self, value):
        max_score = self.initial_data.get('max_score')
        if max_score is not None:
            try:
                max_score = float(max_score)
            except (TypeError, ValueError):
                pass
        # On ne peut pas vérifier précisément si max_score est absent ici,
        # la validation finale se fait dans validate()
        if value < 0:
            raise serializers.ValidationError("score doit être >= 0.")
        return value

    def validate(self, data):
        # s'assurer que score <= max_score
        score = data.get('score', getattr(self.instance, 'score', None))
        max_score = data.get('max_score', getattr(self.instance, 'max_score', None))

        if score is None or max_score is None:
            # si one est manquant, laisser DRF gérer champ requis
            return data

        try:
            s = float(score)
            m = float(max_score)
        except (TypeError, ValueError):
            raise serializers.ValidationError("score et max_score doivent être des nombres.")

        if m <= 0:
            raise serializers.ValidationError("max_score doit être supérieur à 0.")
        if s < 0 or s > m:
            raise serializers.ValidationError("score doit être entre 0 et max_score.")
        return data

    # ---------- representation helpers ----------
    def _round(self, value, ndigits=2):
        """Arrondit une valeur float à ndigits décimales avec ROUND_HALF_UP."""
        dec = Decimal(str(value)).quantize(Decimal(f"0.{'0'*(ndigits-1)}1"), rounding=ROUND_HALF_UP)
        return float(dec)

    def get_normalized_note(self, obj):
        # note ramenée sur 20
        try:
            val = obj.normalized_note()
            return self._round(val, 2)
        except Exception:
            return None

    def get_note_ponderee(self, obj):
        # retourne la contribution d'une évaluation isolée (normalisée * coefficient * poids par type).
        # utile pour affichage; le calcul final par matière se fait via services.subject_final_note
        try:
            val = obj.note_ponderee
            return self._round(val, 2)
        except Exception:
            return None

    def get_student_info(self, obj):
        s = getattr(obj, 'student', None)
        if not s:
            return None
        u = getattr(s, 'user', None)
        return {
            'id': s.pk,
            'prenom': getattr(u, 'first_name', None) if u else None,
            'nom': getattr(u, 'last_name', None) if u else None,
            'username': getattr(u, 'username', None) if u else None,
        }

    def get_teacher_info(self, obj):
        t = getattr(obj, 'teacher', None)
        if not t:
            return None
        u = getattr(t, 'user', None)
        return {
            'id': t.pk,
            'prenom': getattr(u, 'first_name', None) if u else None,
            'nom': getattr(u, 'last_name', None) if u else None,
            'username': getattr(u, 'username', None) if u else None,
        }

    def get_matiere_info(self, obj):
        m = getattr(obj, 'matiere', None)
        if not m:
            return None
        # suppose Matiere a des champs 'nom' et 'coefficient'
        return {
            'id': m.pk,
            'nom': getattr(m, 'nom', str(m)),
            'coefficient': getattr(m, 'coefficient', 1),
        }

    def get_eval_type_display(self, obj):
        return obj.get_eval_type_display()
