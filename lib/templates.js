(function () {
  "use strict";

  const defaultTemplates = [];

  var templates = function () {
    const _self = this;

    let TemplatesList = defaultTemplates;
    if (Array.isArray(this.templates) && this.templates.length)
      TemplatesList.push(...this.templates);

    // Criação do painel
    $(`${this.containerSelector} .main-panel`).append(
      `<div class="toolpanel" id="templates-panel"><div class="content"><p class="title">Templates</p></div></div>`
    );

    // Funções declaradas primeiro
    const createTemplateFromCanvas = (canvas, uuid) => {
      const canvasData = JSON.stringify(canvas.toJSON());
      const preview = canvas.toDataURL({
        format: "png",
        multiplier: 0.2,
      });

      return {
        uuid: uuid,
        preview: preview,
        data: canvasData,
        timestamp: new Date().getTime(),
      };
    };

    const updateTemplateListUI = (containerSelector, templates) => {
      const listContainer = document.querySelector(
        `${containerSelector} .toolpanel#templates-panel .content .list-templates`
      );
      listContainer.innerHTML = "";

      templates.forEach((template, index) => {
        const templateDiv = document.createElement("div");
        templateDiv.className = "button list-templates-item";
        templateDiv.setAttribute("data-index", index);

        const templateImg = document.createElement("img");
        templateImg.src = template.preview;
        templateImg.setAttribute("data-index", index);

        templateDiv.appendChild(templateImg);
        listContainer.appendChild(templateDiv);
      });
    };

    const dispatcEvent = (template, eventName) => {
      const event = new CustomEvent("ImageEditor." + eventName, {
        detail: template,
      });
      window.dispatchEvent(event);
    };

    const handleAddTemplate = () => {
      const uuid = crypto.randomUUID();
      const newTemplate = createTemplateFromCanvas(_self.canvas, uuid);

      TemplatesList.push(newTemplate);
      _self.templates = TemplatesList;
      _self.toast("Template added successfully");

      dispatcEvent(newTemplate, "newTemplate");
      updateTemplateListUI(_self.containerSelector, TemplatesList);
    };

    const deleteTemplate = (index) => {
      if (index >= 0 && index < TemplatesList.length) {
        if (confirm("Are you sure you want to delete this template?")) {
          const templateToDelete = TemplatesList[index];
          TemplatesList.splice(index, 1);
          _self.templates = TemplatesList;
          dispatcEvent(templateToDelete, "deleteTemplate");
          updateTemplateListUI(_self.containerSelector, TemplatesList);
          _self.toast("Template excluído com sucesso");
        }
      }
    };

    const cloneTemplate = (index) => {
      if (index >= 0 && index < TemplatesList.length) {
        const templateToClone = TemplatesList[index];
        const clonedTemplate = {
          ...templateToClone,
          timestamp: new Date().getTime(),
          uuid: crypto.randomUUID(),
          preview: templateToClone.preview,
        };

        TemplatesList.push(clonedTemplate);
        _self.templates = TemplatesList;
        dispatcEvent(clonedTemplate, "newTemplate");
        updateTemplateListUI(_self.containerSelector, TemplatesList);
        _self.toast("Template cloned successfully");
      }
    };

    const saveTemplate = (index) => {
      if (index >= 0 && index < TemplatesList.length) {
        if (confirm("Are you sure you want to save and replace this template?")) {
          const uuid = TemplatesList[index].uuid;
          const updatedTemplate = createTemplateFromCanvas(_self.canvas, uuid);
          TemplatesList[index] = updatedTemplate;
          _self.templates = TemplatesList;
          dispatcEvent(updatedTemplate, "saveTemplate");
          updateTemplateListUI(_self.containerSelector, TemplatesList);
          _self.toast("Template salvo com sucesso");
        }
      }
    };

    // Botão de adicionar template
    const button = document.createElement("button");
    button.className = "button btn";
    button.innerHTML = "Add Template";
    button.onclick = handleAddTemplate;

    const tabContent = document.createElement("div");
    tabContent.className = "tab-content";
    tabContent.append(button);

    $(`${this.containerSelector} .toolpanel#templates-panel .content`).append(tabContent);
    $(`${this.containerSelector} .toolpanel#templates-panel .content`).append('<div class="list-templates"></div>');

    TemplatesList.forEach((img, index) => {
      $(`${this.containerSelector} .toolpanel#templates-panel .content .list-templates`).append(
        `<div class="button list-templates-item" data-index="${index}"><img src="${img.preview}" data-index="${index}" /></div>`
      );
    });

    const contextMenuItems = [
      {
        name: "Preview",
        fn: function (target) {
          alert("Coming soon");
          console.log("Preview", target);
        },
      },
      {
        name: "Salvar",
        fn: function (target) {
          const index = target.getAttribute("data-index");
          saveTemplate(parseInt(index));
        },
      },
      {
        name: "Clone",
        fn: function (target) {
          const index = target.getAttribute("data-index");
          cloneTemplate(parseInt(index));
        },
      },
      {},
      {
        name: "Delete",
        fn: function (target) {
          const index = target.getAttribute("data-index");
          deleteTemplate(parseInt(index));
        },
      },
    ];

    new ContextMenu(".list-templates-item", contextMenuItems);

    $(`${this.containerSelector} .toolpanel#templates-panel .content .list-templates`)
      .on("click", ".button", function () {
        try {
          let index = $(this).data("index");
          _self.applyTemplate(index);
        } catch (_) {
          console.error("can't add template", _);
        }
      });
  };

  window.ImageEditor.prototype.initializeTemplates = templates;
})();
