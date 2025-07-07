from flask_wtf import FlaskForm
from flask_wtf.file import FileField, FileAllowed, FileRequired
from wtforms import StringField, TextAreaField, DateField, FloatField, SelectField, IntegerField
from wtforms.validators import DataRequired, Optional, NumberRange
from datetime import date


class ProjectForm(FlaskForm):
    name = StringField('Project Name', validators=[DataRequired()])
    description = TextAreaField('Description', validators=[Optional()])
    start_date = DateField('Start Date', validators=[DataRequired()], default=date.today)
    end_date = DateField('End Date', validators=[DataRequired()])
    budget = FloatField('Budget', validators=[Optional(), NumberRange(min=0)])
    status = SelectField('Status', choices=[
        ('Planning', 'Planning'),
        ('Active', 'Active'),
        ('Completed', 'Completed'),
        ('Suspended', 'Suspended')
    ], default='Planning')
    location = StringField('Location', validators=[Optional()])
    project_manager = StringField('Project Manager', validators=[Optional()])


class ActivityForm(FlaskForm):
    name = StringField('Activity Name', validators=[DataRequired()])
    description = TextAreaField('Description', validators=[Optional()])
    start_date = DateField('Start Date', validators=[DataRequired()], default=date.today)
    end_date = DateField('End Date', validators=[DataRequired()])
    status = SelectField('Status', choices=[
        ('Not Started', 'Not Started'),
        ('In Progress', 'In Progress'),
        ('Completed', 'Completed'),
        ('Delayed', 'Delayed')
    ], default='Not Started')
    progress_percentage = FloatField('Progress (%)', validators=[Optional(), NumberRange(min=0, max=100)], default=0)
    budget_allocated = FloatField('Budget Allocated', validators=[Optional(), NumberRange(min=0)])
    budget_spent = FloatField('Budget Spent', validators=[Optional(), NumberRange(min=0)], default=0)
    responsible_person = StringField('Responsible Person', validators=[Optional()])


class IndicatorForm(FlaskForm):
    name = StringField('Indicator Name', validators=[DataRequired()])
    type = SelectField('Type', choices=[
        ('Input', 'Input'),
        ('Output', 'Output'),
        ('Outcome', 'Outcome'),
        ('Impact', 'Impact')
    ], validators=[DataRequired()])
    description = TextAreaField('Description', validators=[Optional()])
    unit_of_measure = StringField('Unit of Measure', validators=[Optional()])
    target_value = FloatField('Target Value', validators=[Optional(), NumberRange(min=0)])
    current_value = FloatField('Current Value', validators=[Optional(), NumberRange(min=0)], default=0)
    baseline_value = FloatField('Baseline Value', validators=[Optional(), NumberRange(min=0)], default=0)
    data_source = StringField('Data Source', validators=[Optional()])
    frequency = SelectField('Reporting Frequency', choices=[
        ('', 'Select Frequency'),
        ('Weekly', 'Weekly'),
        ('Monthly', 'Monthly'),
        ('Quarterly', 'Quarterly'),
        ('Semi-annually', 'Semi-annually'),
        ('Annually', 'Annually')
    ], validators=[Optional()])


class DocumentForm(FlaskForm):
    name = StringField('Document Name', validators=[DataRequired()])
    file = FileField('File', validators=[
        FileRequired(),
        FileAllowed(['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'jpg', 'jpeg', 'png'], 
                   'Invalid file type. Allowed: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT, JPG, JPEG, PNG')
    ])
    uploaded_by = StringField('Uploaded By', validators=[Optional()])