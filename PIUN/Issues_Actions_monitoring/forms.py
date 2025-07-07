from django import forms
from django.contrib.auth import get_user_model
from .models import issue_action_source, IssueActions
from PIU_Financial_mgt.models import Project, KPI_For_Contract
from setup.models import YEAR, Quarter

User = get_user_model()

class IssueActionSourceForm(forms.ModelForm):
    class Meta:
        model = issue_action_source
        fields = ['issue_action_source']
        widgets = {
            'issue_action_source': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Enter issue/action source name'
            })
        }
        labels = {
            'issue_action_source': 'Issue/Action Source Name'
        }

    def __init__(self, *args, **kwargs):
        self.user = kwargs.pop('user', None)
        super().__init__(*args, **kwargs)

    def save(self, commit=True):
        instance = super().save(commit=False)
        if self.user:
            instance.loginuser = self.user
        if commit:
            instance.save()
        return instance


class IssueActionsForm(forms.ModelForm):
    class Meta:
        model = IssueActions
        fields = [
            'project', 'year', 'quarter', 'issue_code', 'issue_action_type',
            'description_of_issue_or_action', 'source_of_issue_or_action',
            'status', 'priority', 'assigned_to', 'due_date', 'remarks'
        ]
        widgets = {
            'project': forms.Select(attrs={'class': 'form-select'}),
            'year': forms.Select(attrs={'class': 'form-select'}),
            'quarter': forms.Select(attrs={'class': 'form-select'}),
            'issue_code': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Enter unique issue code'
            }),
            'issue_action_type': forms.Select(attrs={'class': 'form-select'}),
            'description_of_issue_or_action': forms.Textarea(attrs={
                'class': 'form-control',
                'rows': 4,
                'placeholder': 'Describe the project issue or corrective action required'
            }),
            'source_of_issue_or_action': forms.Select(attrs={'class': 'form-select'}),
            'status': forms.Select(attrs={'class': 'form-select'}),
            'priority': forms.Select(attrs={'class': 'form-select'}),
            'assigned_to': forms.Select(attrs={'class': 'form-select'}),
            'due_date': forms.DateInput(attrs={
                'class': 'form-control',
                'type': 'date'
            }),
            'remarks': forms.Textarea(attrs={
                'class': 'form-control',
                'rows': 3,
                'placeholder': 'Project-specific notes or action progress updates'
            })
        }

    def __init__(self, *args, **kwargs):
        self.user = kwargs.pop('user', None)
        super().__init__(*args, **kwargs)
        
        # Populate choice fields
        self.fields['project'].queryset = Project.objects.all()
        self.fields['year'].queryset = YEAR.objects.all()
        self.fields['quarter'].queryset = Quarter.objects.all()
        self.fields['issue_action_type'].queryset = KPI_For_Contract.objects.all()
        self.fields['source_of_issue_or_action'].queryset = issue_action_source.objects.all()
        self.fields['assigned_to'].queryset = User.objects.all()
        self.fields['assigned_to'].required = False
        self.fields['remarks'].required = False

    def save(self, commit=True):
        instance = super().save(commit=False)
        if self.user:
            instance.loginUser = self.user
        if commit:
            instance.save()
        return instance


class IssueActionsFilterForm(forms.Form):
    project = forms.ModelChoiceField(
        queryset=Project.objects.all(),
        required=False,
        empty_label="All Projects",
        widget=forms.Select(attrs={'class': 'form-select'})
    )
    year = forms.ModelChoiceField(
        queryset=YEAR.objects.all(),
        required=False,
        empty_label="All Years",
        widget=forms.Select(attrs={'class': 'form-select'})
    )
    quarter = forms.ModelChoiceField(
        queryset=Quarter.objects.all(),
        required=False,
        empty_label="All Quarters",
        widget=forms.Select(attrs={'class': 'form-select'})
    )
    status = forms.ChoiceField(
        choices=[('', 'All Status')] + IssueActions._meta.get_field('status').choices,
        required=False,
        widget=forms.Select(attrs={'class': 'form-select'})
    )
    priority = forms.ChoiceField(
        choices=[('', 'All Priorities')] + IssueActions._meta.get_field('priority').choices,
        required=False,
        widget=forms.Select(attrs={'class': 'form-select'})
    )
    assigned_to = forms.ModelChoiceField(
        queryset=User.objects.all(),
        required=False,
        empty_label="All Assignees",
        widget=forms.Select(attrs={'class': 'form-select'})
    )