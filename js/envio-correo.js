const EnvioCorreo = {
  _plantillaAprobacion(solicitud) {
    const nombre = solicitud.nombreUsuario || "Usuario";
    const detalle = Solicitudes.resumenDetalle(solicitud);
    const tipo = Solicitudes.etiquetaTipo(solicitud.tipo);

    return (
      '<div style="font-family:Segoe UI,Arial,sans-serif;max-width:560px;margin:0 auto;color:#1a1a1a;">' +
      '<div style="background:#007bff;color:#fff;padding:20px 24px;border-radius:12px 12px 0 0;">' +
      "<h1 style=\"margin:0;font-size:22px;\">¡Tu solicitud fue aprobada!</h1>" +
      "<p style=\"margin:8px 0 0;opacity:.95;\">Biblioteca SENA</p></div>" +
      '<div style="border:1px solid #e0e0e0;border-top:none;padding:24px;border-radius:0 0 12px 12px;">' +
      "<p>Hola <strong>" +
      nombre +
      "</strong>,</p>" +
      "<p>Nos complace informarte que tu solicitud ha sido <strong style=\"color:#198754;\">aprobada</strong> por el equipo de biblioteca.</p>" +
      '<table style="width:100%;border-collapse:collapse;margin:16px 0;">' +
      "<tr><td style=\"padding:8px 0;color:#5c5c5c;\">Tipo</td><td style=\"padding:8px 0;\"><strong>" +
      tipo +
      "</strong></td></tr>" +
      "<tr><td style=\"padding:8px 0;color:#5c5c5c;\">Detalle</td><td style=\"padding:8px 0;\">" +
      detalle +
      "</td></tr>" +
      "<tr><td style=\"padding:8px 0;color:#5c5c5c;\">Estado</td><td style=\"padding:8px 0;\">Aprobada</td></tr>" +
      "</table>" +
      "<p>Te esperamos en la fecha acordada. Si necesitas hacer un cambio, comunícate con biblioteca.</p>" +
      "<p style=\"margin-top:24px;color:#5c5c5c;font-size:14px;\">Gracias por usar nuestro sistema de gestión bibliotecaria.<br><strong>Biblioteca SENA</strong></p>" +
      "</div></div>"
    );
  },

  _plantillaRechazo(solicitud, motivo) {
    const nombre = solicitud.nombreUsuario || "Usuario";
    const detalle = Solicitudes.resumenDetalle(solicitud);
    const tipo = Solicitudes.etiquetaTipo(solicitud.tipo);

    return (
      '<div style="font-family:Segoe UI,Arial,sans-serif;max-width:560px;margin:0 auto;color:#1a1a1a;">' +
      '<div style="background:#dc3545;color:#fff;padding:20px 24px;border-radius:12px 12px 0 0;">' +
      "<h1 style=\"margin:0;font-size:22px;\">Actualización de tu solicitud</h1>" +
      "<p style=\"margin:8px 0 0;opacity:.95;\">Biblioteca SENA</p></div>" +
      '<div style="border:1px solid #e0e0e0;border-top:none;padding:24px;border-radius:0 0 12px 12px;">' +
      "<p>Hola <strong>" +
      nombre +
      "</strong>,</p>" +
      "<p>Lamentamos informarte que tu solicitud no pudo ser aprobada en esta ocasión.</p>" +
      '<table style="width:100%;border-collapse:collapse;margin:16px 0;">' +
      "<tr><td style=\"padding:8px 0;color:#5c5c5c;\">Tipo</td><td style=\"padding:8px 0;\"><strong>" +
      tipo +
      "</strong></td></tr>" +
      "<tr><td style=\"padding:8px 0;color:#5c5c5c;\">Detalle</td><td style=\"padding:8px 0;\">" +
      detalle +
      "</td></tr>" +
      "</table>" +
      '<div style="background:#fff5f5;border-left:4px solid #dc3545;padding:12px 14px;margin:16px 0;">' +
      "<strong>Motivo del rechazo:</strong><br>" +
      motivo +
      "</div>" +
      "<p>Puedes enviar una nueva solicitud con otra fecha o revisar la disponibilidad en el sistema.</p>" +
      "<p style=\"margin-top:24px;color:#5c5c5c;font-size:14px;\">Atentamente,<br><strong>Biblioteca SENA</strong></p>" +
      "</div></div>"
    );
  },

  async enviar({ correo, asunto, cuerpoHtml, nombreUsuario }) {
    if (!correo) {
      throw new Error("El usuario no tiene correo registrado.");
    }

    if (typeof emailjs !== "undefined" && ConfigCorreo.estaConfigurado()) {
      emailjs.init({ publicKey: ConfigCorreo.publicKey });
      await emailjs.send(ConfigCorreo.serviceId, ConfigCorreo.templateId, {
        to_email: correo,
        subject: asunto,
        message_html: cuerpoHtml,
        user_name: nombreUsuario || "Usuario",
      });
      return { ok: true, metodo: "emailjs" };
    }

    const ventana = window.open("", "_blank");
    if (ventana) {
      ventana.document.write(cuerpoHtml);
      ventana.document.close();
    }

    return {
      ok: true,
      metodo: "vista-previa",
      aviso:
        "EmailJS no está configurado. Se abrió una vista previa del correo. Configura js/config-correo.js para envío automático a Gmail.",
    };
  },

  async enviarAprobacion(solicitud) {
    const asunto =
      "✅ Solicitud aprobada — " + Solicitudes.etiquetaTipo(solicitud.tipo);
    return this.enviar({
      correo: solicitud.correo,
      asunto: asunto,
      cuerpoHtml: this._plantillaAprobacion(solicitud),
      nombreUsuario: solicitud.nombreUsuario,
    });
  },

  async enviarRechazo(solicitud, motivo) {
    const asunto =
      "❌ Solicitud no aprobada — " + Solicitudes.etiquetaTipo(solicitud.tipo);
    return this.enviar({
      correo: solicitud.correo,
      asunto: asunto,
      cuerpoHtml: this._plantillaRechazo(solicitud, motivo),
      nombreUsuario: solicitud.nombreUsuario,
    });
  },
};
