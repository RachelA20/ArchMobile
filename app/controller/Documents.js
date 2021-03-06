/**
 * Handles events generated by the app document feature
 * @author Cristina Reghina
 * @author Ana Paduraru
 * @since 21.2
 */
Ext.define('AssetAndEquipmentSurvey.controller.Documents', {
    extend: 'Ext.app.Controller',

    config: {
        refs: {
            mainView: 'main',
            taskEditView: 'taskEditPanel',
            documentViewItem: 'documentItem',
            cameraPanel: 'camera',
            taskPromptListPanel: 'taskPromptList',
            documentListView: 'taskDocumentList'
        },
        control: {
            cameraPanel: {
                attach: 'onAttachPhoto'
            },
            documentViewItem: {
                displaydocument: 'onDisplayDocument'
            }
        },

        photoReplaceTitle: LocaleManager.getLocalizedString('Attach photo',
            'AssetAndEquipmentSurvey.controller.Documents'),

        photoReplaceMessage: LocaleManager.getLocalizedString('Overwrite existing photo?',
            'AssetAndEquipmentSurvey.controller.Documents')
    },

    onDisplayDocument: function (mobileTaskId, fileName, documentFieldId, fieldName) {
        var me = this,
            surveyTasksStore = Ext.getStore('surveyTasksStore'),
            taskEditRecord = surveyTasksStore.findRecord('id', mobileTaskId),
            documentField = fieldName + '_contents',
            documentData;

        if (taskEditRecord) {
            documentData = taskEditRecord.get(documentField);
            // If the document is an image then we display it using the photo panel
            DocumentManager.displayDocumentOrImage(documentData, fileName, me.getCameraPanel());
        }
    },

    /**
     * Saves the photo data in the Task Edit record.
     * @param cameraPanel
     */
    onAttachPhoto: function (cameraPanel) {
        var me = this,
            imageData = cameraPanel.getImageData(),
            taskEditView = me.getMainView().getNavigationBar().getCurrentView(),
            taskEditRecord,
            surveyTasksStore = Ext.getStore('surveyTasksStore'),
            documentListView = me.getDocumentListView(),
            attachPhotoFunction = function () {
                document.activeElement.blur();
                // Disable autoSync on the Tasks store to prevent update timing errors.
                surveyTasksStore.setAutoSync(false);
                me.addPhotoToTaskEditRecord(taskEditRecord, imageData);

                if (!Ext.isEmpty(documentListView)) {
                    documentListView.setRecord(taskEditRecord);
                }

                // If this is an update view we need to save the Task record
                if (Ext.isFunction(taskEditView.getIsCreateView) && taskEditView.getIsCreateView()) {
                    taskEditView.applyPhotoData();
                } else {
                    surveyTasksStore.sync();
                }

                surveyTasksStore.setAutoSync(true);
                cameraPanel.onClosePanel();
            };

        //verify if camera panel was opened from add form
        if (AssetAndEquipmentSurvey.util.Ui.lastViewDispayed.xtype === 'taskEditPanel') {
            // add form is modal and it is not the currentView in the navigationBar
            taskEditView = AssetAndEquipmentSurvey.util.Ui.lastViewDispayed;
        }

        taskEditRecord = taskEditView.getRecord();

        if (taskEditRecord.hasPhotoDocument()) {
            Ext.Msg.confirm(me.getPhotoReplaceTitle(), me.getPhotoReplaceMessage(),
                function (buttonId) {
                    if (buttonId === 'yes') {
                        attachPhotoFunction();
                    }
                }
            );
        } else {
            attachPhotoFunction();
        }
    },

    addPhotoToTaskEditRecord: function (taskEditRecord, imageData) {
        var documentField = taskEditRecord.getDocumentField();

        taskEditRecord.setDocumentFieldData(documentField, imageData);
    }

});